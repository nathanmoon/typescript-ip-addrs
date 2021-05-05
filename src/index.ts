import assert from "assert/strict";

type IpAddress = string;

// all ip addresses with a given request count
// double-linked list for quick updates of sort order
type OrderedIpAddressBucket = {
  count: number;
  ipAddresses: Set<IpAddress>;
  up: OrderedIpAddressBucket | null;
  down: OrderedIpAddressBucket | null;
};

type IpAddresses = Map<IpAddress, OrderedIpAddressBucket>;

// top-level key/value store of ip address counts
const ipAddresses: IpAddresses = new Map();

// pointer to bucket with highest count
let topBucket: OrderedIpAddressBucket | null = null;

// pointer to bucket with lowest count
let bottomBucket: OrderedIpAddressBucket | null = null;

function createBucket(
  ipAddress: IpAddress,
  count: number
): OrderedIpAddressBucket {
  return {
    count,
    ipAddresses: new Set([ipAddress]),
    up: null,
    down: null,
  };
}

function insertAtBottom(ipAddress: IpAddress): void {
  if (bottomBucket == null) {
    // very first bucket
    const bucket = createBucket(ipAddress, 1);
    bottomBucket = bucket;
    topBucket = bucket;
    ipAddresses.set(ipAddress, bucket);
  } else if (bottomBucket.count == 1) {
    // add to existing bottom bucket
    bottomBucket.ipAddresses.add(ipAddress);
    ipAddresses.set(ipAddress, bottomBucket);
  } else {
    // add new bottom bucket
    const bucket = createBucket(ipAddress, 1);
    bottomBucket.down = bucket;
    bucket.up = bottomBucket;
    bottomBucket = bucket;
    ipAddresses.set(ipAddress, bucket);
  }
}

function removeIpAddress(
  bucket: OrderedIpAddressBucket,
  ipAddress: IpAddress
): void {
  assert(bucket.ipAddresses.has(ipAddress));
  bucket.ipAddresses.delete(ipAddress);
  ipAddresses.delete(ipAddress);
}

function addIpAddress(
  ipAddress: IpAddress,
  count: number,
  previousBucket: OrderedIpAddressBucket
): void {
  // find insertion spot
  assert(previousBucket.count < count);
  let nextBucket = previousBucket.up;
  if (!nextBucket) {
    // insert at top
    assert(topBucket !== null);
    assert(topBucket.count < count);
    const bucket = createBucket(ipAddress, count);
    topBucket.up = bucket;
    bucket.down = topBucket;
    topBucket = bucket;
    ipAddresses.set(ipAddress, bucket);
  } else if (nextBucket.count == count) {
    // add to existing bucket
    nextBucket.ipAddresses.add(ipAddress);
    ipAddresses.set(ipAddress, nextBucket);
  } else {
    // insert new bucket in-between
    const newBucket = createBucket(ipAddress, count);
    newBucket.up = nextBucket;
    newBucket.down = previousBucket;
    nextBucket.down = newBucket;
    previousBucket.up = newBucket;
    ipAddresses.set(ipAddress, newBucket);
  }
}

function removeBucket(bucket: OrderedIpAddressBucket): void {
  const upBucket = bucket.up;
  const downBucket = bucket.down;
  if (upBucket) {
    upBucket.down = bucket.down;
  } else {
    assert(bucket == topBucket);
    topBucket = bucket.down;
  }
  if (downBucket) {
    downBucket.up = bucket.up;
  } else {
    assert(bucket == bottomBucket);
    bottomBucket = bucket.up;
  }
}

function verifyStructure(): void {
  //console.log(ipAddresses);
  assert(topBucket == null || topBucket.up == null);
  assert(bottomBucket == null || bottomBucket.down == null);
  let bucket = topBucket;
  while (bucket !== null) {
    if (bucket !== topBucket) {
      assert(bucket.up !== null, "missing up");
      assert(bucket.up.down == bucket, "bad pointers 1");
    }
    if (bucket !== bottomBucket) {
      assert(bucket.down !== null, "missing down");
      assert(bucket.down.up == bucket, "bad pointers 2");
    }
    assert(bucket.ipAddresses.size > 0);
    for (let item of bucket.ipAddresses) {
      assert(ipAddresses.get(item) == bucket, "bad map");
    }
    bucket = bucket.down;
  }
}

export function requestHandled(ipAddress: IpAddress): void {
  //console.log("##ip", ipAddress);
  const bucket = ipAddresses.get(ipAddress);
  if (bucket) {
    // "remove" from current bucket
    removeIpAddress(bucket, ipAddress);
    // "insert" again with count+1
    addIpAddress(ipAddress, bucket.count + 1, bucket);
    // clean up original bucket if empty
    if (bucket.ipAddresses.size == 0) {
      removeBucket(bucket);
    }
  } else {
    // first occurrence
    insertAtBottom(ipAddress);
  }
  //verifyStructure();
}

export function top100(): IpAddress[] {
  let topIpAddresses: IpAddress[] = [];
  let bucket = topBucket;
  while (bucket && topIpAddresses.length < 100) {
    topIpAddresses = topIpAddresses.concat(Array.from(bucket.ipAddresses));
    bucket = bucket.down;
  }
  return topIpAddresses.slice(0, 100);
}

export function clear(): void {
  ipAddresses.clear();
  topBucket = null;
  bottomBucket = null;
}
