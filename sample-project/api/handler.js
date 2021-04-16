const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

exports.sample = async (event, context, callback) => {
    const id = event.pathParameters.id;
    const httpMethod = event.httpMethod;
    console.info(`id: ${id}`)
    console.info(`httpMethod: ${httpMethod}`)
    if (httpMethod === 'GET') {
        console.info(`inside get`)
        const value = await sampleGet(id);
        console.info(`value: ${JSON.stringify(value, null, '\t')}`)
        const response = apiGatewayResponse(200, value);
        console.info(`response: ${JSON.stringify(response, null, '\t')}`)
        callback(null, response);
    } else if (httpMethod === 'POST') {
        console.info(`inside post`)
        const value = await samplePost(id, event);
        console.info(`value: ${JSON.stringify(value, null, '\t')}`)
        const response = apiGatewayResponse(200, value);
        console.info(`response: ${JSON.stringify(response, null, '\t')}`)
        callback(null, response);
    } else {
        callback(new Error('not called via APIG GET or POST. Did you try testing this from the Lambda Console? Read the comments in code.'))
        // https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request
        // Set the test event to include the different elements used above if trying this from the console.
    }
}

function sampleGet(key) {
    var params = {
        TableName: process.env.TABLE_NAME,
        Key: { id: key },
        ReturnConsumedCapacity: 'INDEXES'
    };
    return docClient.get(params).promise()
}

function samplePost(key, event) {
    console.info(`event: ${JSON.stringify(event, null, '\t')}`);
    var params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            id: key,
            data: event.body
        },
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE'
    };
    return docClient.put(params).promise()
}

function apiGatewayResponse(statusCode, body) {
    return {
        body: JSON.stringify(body, null, '\t'),
        statusCode: statusCode
    }
}