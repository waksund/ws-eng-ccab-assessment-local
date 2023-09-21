import { performance } from "perf_hooks";
import supertest from "supertest";
import { buildApp } from "./app";
import assert from "assert";

const app = supertest(buildApp());

async function basicLatencyTest() {
    await app.post("/reset").expect(204);
    const start = performance.now();
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    console.log(`Latency: ${performance.now() - start} ms`);
}

async function parallelQueriesTest(){
    const acc: string = "acc_1";
    const balance: number = 100;
    await app.post("/reset").send({ account: acc }).expect(204);
    Promise.all([
        app.post("/charge").send({ account: acc, charges: balance }),
        app.post("/charge").send({ account: acc, charges: balance })
    ]).then((values) => {
        assert(values.some(v => {
            console.log(v.text);
            let obj = JSON.parse(v.text);
            return obj.isAuthorized == false;
        }),"one of operations should be isAuthorized: false");
    });
}

async function runTests() {
    // await basicLatencyTest();
    await parallelQueriesTest();
}

runTests().catch(console.error);
