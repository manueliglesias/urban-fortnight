"use strict";

var inquirer = require('inquirer');
var WebSocket = require('ws');
global.WebSocket = global.WebSocket || WebSocket;
require('isomorphic-fetch');

var AppSyncConfig = require('./AppSync');
var AWSAppSyncClient = require('aws-appsync').default;
var gql = require('graphql-tag');

var client = new AWSAppSyncClient({
    url: AppSyncConfig.graphqlEndpoint,
    region: AppSyncConfig.region,
    auth: {
        type: AppSyncConfig.authType,
        apiKey: AppSyncConfig.apiKey
    },
    disableOffline: true
});

var subscription = null;

(function ask(forceQuit) {
    if (forceQuit) {
        console.log('quiting');
        return;
    }

    inquirer.prompt({
        name: 'choice',
        type: 'expand',
        default: 0,
        choices: [
            { key: 'n', name: 'No', value: 'N' },
            { key: 'y', name: 'Yes', value: 'Y' },
            { key: 'q', name: 'Quit', value: 'Q' }
        ],
        message: subscription ? 'Unsubscribe' : 'Subscribe'
    }).then(function (answers) {
        var answer = answers.choice;

        if (answer === 'N') {
            return ask(false);
        }

        if (answer === 'Y' || (subscription && answer === 'Q')) {
            if (!subscription) {
                console.log('subscribing');
                subscription = client.subscribe({
                    query: gql`subscription S($eventId: String!) {
                        subscribeToEventComments(
                            eventId: $eventId
                        ) {
                            eventId
                            commentId
                            content
                            createdAt
                        }
                    }`,
                    variables: { eventId: "45a8bc47-6f42-43bf-9b88-ac921c008a77" }
                }).subscribe({
                    next: data => console.log(data)
                });
            } else {
                console.log('unsubscribing');
                subscription.unsubscribe();
                subscription = null;
            }
        }

        ask(answer === 'Q');
    });
})();
