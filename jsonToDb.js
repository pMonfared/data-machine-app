import { Sender } from "@questdb/nodejs-client";
import fs from "fs";
import JSONStream from "JSONStream";
import es from "event-stream";

var getStream = function () {
  var jsonData = "FilteredDataHuman.json",
    stream = fs.createReadStream(jsonData, { encoding: "utf8" }),
    parser = JSONStream.parse("*");
  return stream.pipe(parser);
};

async function main() {
  const sender = new Sender();
  await sender.connect({
    host: "localhost",
    port: 9009,
  });

  await sender.createTable("instances", {
    timestamp: "TIMESTAMP",
    _id: "STRING",
    instanceId: "INT",
    pos_x: "FLOAT",
    pos_y: "FLOAT",
    vel_x: "FLOAT",
    vel_y: "FLOAT",
    confidence: "FLOAT",
    sensors: "STRING",
  });

  getStream().pipe(
    es.mapSync(function (obj) {
      console.log(obj);
      const timestamp = obj.timestamp.$date.$numberLong;
      const _id = obj._id.$oid;
      const instanceId = 1; // Assuming all instances have the same ID
      const pos_x = obj.instances[instanceId].pos_x;
      const pos_y = obj.instances[instanceId].pos_y;
      const vel_x = obj.instances[instanceId].vel_x;
      const vel_y = obj.instances[instanceId].vel_y;
      const confidence = obj.instances[instanceId].confidence;
      const sensors = JSON.stringify(obj.instances[instanceId].sensors);

      sender
        .table("instances")
        .timestamp(timestamp)
        ._id(_id)
        .instanceId(instanceId)
        .pos_x(pos_x)
        .pos_y(pos_y)
        .vel_x(vel_x)
        .vel_y(vel_y)
        .confidence(confidence)
        .sensors(sensors)
        .at(timestamp, "ms");
    })
  );

  await sender.flush();
  await sender.close();
}

main();
