const connectToDatabase = require("../server/db");
const ObjectId = require("mongodb").ObjectID;

exports.findDocument = async (query, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];
    let document = await db.collection(collectionName).findOne(query);
    client.close();
    return document;
  } catch (e) {
    throw e.message;
  }
};

exports.createOne = async (data, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];
    let response = await db.collection(collectionName).insertOne(data);
    client.close();
    return response.ops[0];
  } catch (e) {
    throw e.message;
  }
};

exports.resetPassword = async (id, password, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];
    await db.collection(collectionName).updateOne(
      { _id: id },
      {
        $set: { password }
      }
    );
    client.close();
    return;
  } catch (e) {
    throw e.message;
  }
};

exports.listAllDocuments = async collectionName => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];
    const cursor = await db.collection(collectionName).find({});
    const docList = [];
    await cursor.forEach(doc => {
      docList.push(doc);
    });

    client.close();
    return docList;
  } catch (e) {
    throw e.message;
  }
};

exports.listOneDocument = async (id, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];

    const _id = new ObjectId(id);
    const document = await db.collection(collectionName).findOne({ _id });
    client.close();
    if (document === null) {
      return null;
    }

    return document;
  } catch (e) {
    throw e.message;
  }
};

exports.updateOneDocument = async (id, data, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];
    const _id = new ObjectId(id);

    await db.collection(collectionName).updateOne({ _id }, { $set: data });
    client.close();

    return;
  } catch (e) {
    throw e.message;
  }
};

exports.updateOneDocumentById = async (id, data, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];
    await db.collection(collectionName).updateOne({ _id: id }, { $set: data });
    client.close();

    return;
  } catch (e) {
    throw e.message;
  }
};

exports.updateMultipleDocuments = async (dataList, data, collectionName) => {
  try {
    dataList.forEach(async id => {
      const result = await connectToDatabase();
      const client = result[0];
      const db = result[1];
      const _id = new ObjectId(id);
      await db.collection(collectionName).updateOne({ _id }, { $set: data });
      client.close();
    });
    return;
  } catch (e) {
    throw e.message;
  }
};

exports.deleteOneDocument = async (id, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];

    const _id = new ObjectId(id);
    await db.collection(collectionName).deleteOne({ _id });
    client.close();

    return;
  } catch (e) {
    throw e.message;
  }
};

exports.deleteOneDocumentById = async (id, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];

    await db.collection(collectionName).deleteOne({ _id: id });
    client.close();

    return;
  } catch (e) {
    throw e.message;
  }
};

exports.deleteMultipleDocuments = async (dataList, collectionName) => {
  try {
    dataList.forEach(async dataItem => {
      const result = await connectToDatabase();
      const client = result[0];
      const db = result[1];
      const _id = new ObjectId(dataItem);
      await db.collection(collectionName).deleteOne({ _id });
      client.close();
    });
    return;
  } catch (e) {
    throw e.message;
  }
};

exports.processQuery = async (queryParam, collectionName) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];

    const docList = [];
    const cursor = await db.collection(collectionName).find(queryParam);
    await cursor.forEach(doc => {
      docList.push(doc);
    });
    client.close();
    return docList;
  } catch (e) {
    throw e.message;
  }
};

exports.processQueryWithSkipAndLimit = async (
  skip,
  limit,
  order,
  field,
  queryParam,
  collectionName
) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];

    const cursor = await db
      .collection(collectionName)
      .aggregate([
        {
          $facet: {
            docList: [
              { $match: queryParam },
              { $sort: { [field]: order } },
              { $limit: limit },
              { $skip: skip }
            ],
            docCount: [
              { $match: queryParam },
              {
                $count: "count"
              }
            ]
          }
        }
      ])
      .toArray();

    client.close();

    return {
      docList: cursor[0].docList,
      docCount:
        cursor[0].docCount[0] !== undefined ? cursor[0].docCount[0].count : 0
    };
  } catch (e) {
    throw e.message;
  }
};

exports.listDriversWithSkipLimitAndLookup = async (
  skip,
  limit,
  field,
  order,
  queryParam
) => {
  try {
    const result = await connectToDatabase();
    const client = result[0];
    const db = result[1];

    const cursor = await db
      .collection("driver")
      .aggregate([
        {
          $facet: {
            docList: [
              { $match: queryParam },
              {
                $addFields: {
                  currentbooking: { $toObjectId: "$currentbooking" }
                }
              },
              {
                $lookup: {
                  from: "bookings",
                  let: { bookingid: "$currentbooking" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$bookingid"] } } },
                    {
                      $project: {
                        _id: 0,
                        "carinfo.ownername": 1,
                        "carinfo.vin": 1,
                        "carinfo.make": 1,
                        "carinfo.model": 1,
                        "carinfo.end": 1,
                        "carinfo.extendeddate": 1
                      }
                    }
                  ],
                  as: "bookinginfo"
                }
              },
              {
                $unwind: {
                  path: "$bookinginfo",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $sort:
                  field === "ownername"
                    ? { "bookinginfo.carinfo.ownername": order }
                    : field === "vin"
                    ? { "bookinginfo.carinfo.vin": order }
                    : field === "make"
                    ? { "bookinginfo.carinfo.make": order }
                    : field === "model"
                    ? { "bookinginfo.carinfo.model": order }
                    : field === "extendeddate"
                    ? { "bookinginfo.carinfo.extendeddate": order }
                    : { [field]: order }
              },
              { $limit: limit },
              { $skip: skip }
            ],
            docCount: [
              { $match: queryParam },
              {
                $count: "count"
              }
            ]
          }
        }
      ])
      .toArray();

    client.close();
    return {
      docList: cursor[0].docList,
      docCount:
        cursor[0].docCount[0] !== undefined ? cursor[0].docCount[0].count : 0
    };
  } catch (e) {
    throw e.message;
  }
};
