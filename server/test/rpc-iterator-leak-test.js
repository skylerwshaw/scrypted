const assert = require('node:assert/strict');
const { RpcPeer } = require('../dist/rpc');

let producer;
let consumer;

producer = new RpcPeer('producer', 'consumer', message => consumer.handleMessage(message));
consumer = new RpcPeer('consumer', 'producer', message => producer.handleMessage(message));

async function* values() {
    yield 1;
    yield 2;
}

async function testIteratorReturnReleasesGenerator() {
    producer.params.values = values();

    const remote = await consumer.getParam('values');
    assert.deepEqual(await remote.next(), { value: 1, done: false });
    assert.equal(producer.yieldedAsyncIterators.size, 1,
        'the producer should retain an iterator while it can yield more values');

    await remote.return();
    assert.equal(producer.yieldedAsyncIterators.size, 0,
        'returning a remote iterator must release it on the producer');
}

testIteratorReturnReleasesGenerator()
    .finally(() => {
        producer.kill('test complete');
        consumer.kill('test complete');
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
