---
title: Redis Hash Slot Failure via Topology
layout: post
tags: ['DevOps']
---

One of the (many) problems with running a production grade Redis cluster in my experience has been maintaining the topology of the cluster. 

What’s that? When you run Redis in Cluster mode, you run several processes of Redis [aside: upto 1 per core, and upto ~80% RAM utilization total, in my experience is the maximum before you end up having to face the dreaded issues with RAM overusage when dumps are created, leading to crashes], with each process being either run in master mode, or run as a replica of a master, and with each master assigned a fixed hash slot.

There are two reasons why you run in cluster mode:

1. Importantly, to scale beyond the single process limitation in Redis
2. Less importantly, for High Availability (as this can be achieved by sentinel as well)

The problem of topology comes up when you care about High Availability in the Redis Cluster—if you’re not careful, you can run into situations where:

1. Too many of the replicas of a master are on the same host as the master. Here, if that single host fails, the entire hash slot has a chance to fail.
2. Too many masters are on the same host. Here, if that single host fails, multiple hash slots will need to switch over simultaneously.

The second issue is significantly less of a problem than the first, as switchovers are relatively uneventful most of the time. The rest of this article describes how you can deal with the first issue. You can use similar techniques for the second one too.

# Monitoring Topology

Finding the current topology of the redis cluster is super easy, just run

```bash
# note, this is an O(N) @slow command - you don't want to spam your instance with this every second!
> CLUSTER NODES

# example taken from the official docs: https://redis.io/commands/cluster-nodes/
# note the ips, and the mapping of who is a master to whom
# <id>                                   <ip:port@cport[,hostname]>      <flags> <master> <ping-sent> <pong-recv> <config-epoch> <link-state> <slot> <slot> ... <slot>
07c37dfeb235213a872192d90877d0cd55635b91 127.0.0.1:30004@31004,hostname4 slave e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca 0 1426238317239 4 connected
67ed2db8d677e59ec4a4cefb06858cf2a1a89fa1 127.0.0.1:30002@31002,hostname2 master - 0 1426238316232 2 connected 5461-10922
292f8b365bb7edb5e285caf0b7e6ddc7265d2f4f 127.0.0.1:30003@31003,hostname3 master - 0 1426238318243 3 connected 10923-16383
6ec23923021cf3ffec47632106199cb7f496ce01 127.0.0.1:30005@31005,hostname5 slave 67ed2db8d677e59ec4a4cefb06858cf2a1a89fa1 0 1426238316232 5 connected
824fe116063bc5fcf9f4ffd895bc17aee7731ac3 127.0.0.1:30006@31006,hostname6 slave 292f8b365bb7edb5e285caf0b7e6ddc7265d2f4f 0 1426238317741 6 connected
e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca 127.0.0.1:30001@31001,hostname1 myself,master - 0 0 1 connected 0-5460
```

From here, we can build a representation of which nodes are replicas of which nodes and which nodes lie on which host, using which we can deduce the topology and which hash slots are at risk. To do this, we just map the `ip:port` pair to the current state flag (`slave` or `master`), and the master’s id following it. 

This is a bit tedious, so you can use this convenience script I’ve written:

```bash
# MIT Licenced, feel free to fork/copy from: https://github.com/vaishnavsm/redis-topology-monitor
# note that in this example, I used a docker network, 
# and so each redis instance is on a different "host"
npx redis-topology-monitor find-topology -u redis://localhost:6379 -a password
Overview
-------
👏 Looks like your cluster is evenly distributed, and no host contains more than one instance of a hash slot
┌─────────┬─────────────┬─────────────────┬─────────────────────┬───────────────────────────────────────┬────────────────────────────────────────────┬─────────────────────────┐
│ (index) │ Slot Number │ Number of Hosts │ Maximum on One Host │                 Hosts                 │                 Master Id                  │     Master Address      │
├─────────┼─────────────┼─────────────────┼─────────────────────┼───────────────────────────────────────┼────────────────────────────────────────────┼─────────────────────────┤
│    0    │      1      │        3        │          1          │ '172.25.0.4, 172.25.0.8, 172.25.0.7'  │ '5164940d4f389030a47af63447f2f8b425b17fd0' │ '172.25.0.4:6379@16379' │
│    1    │      2      │        3        │          1          │ '172.25.0.2, 172.25.0.5, 172.25.0.6'  │ '9cbfd6b8fcc1defbf1e726ee22c1a727cb20c1ef' │ '172.25.0.2:6379@16379' │
│    2    │      3      │        3        │          1          │ '172.25.0.9, 172.25.0.3, 172.25.0.10' │ 'b2bc47d17f4ce689fffc4e6a49c9a45f9487996f' │ '172.25.0.9:6379@16379' │
└─────────┴─────────────┴─────────────────┴─────────────────────┴───────────────────────────────────────┴────────────────────────────────────────────┴─────────────────────────┘

Slots by Host
-------
┌─────────┬───────────────┬────────┬────────┬────────┐
│ (index) │     Host      │ Slot 1 │ Slot 2 │ Slot 3 │
├─────────┼───────────────┼────────┼────────┼────────┤
│    0    │ '172.25.0.4'  │   1    │        │        │
│    1    │ '172.25.0.8'  │   1    │        │        │
│    2    │ '172.25.0.7'  │   1    │        │        │
│    3    │ '172.25.0.2'  │        │   1    │        │
│    4    │ '172.25.0.5'  │        │   1    │        │
│    5    │ '172.25.0.6'  │        │   1    │        │
│    6    │ '172.25.0.9'  │        │        │   1    │
│    7    │ '172.25.0.3'  │        │        │   1    │
│    8    │ '172.25.0.10' │        │        │   1    │
└─────────┴───────────────┴────────┴────────┴────────┘

Slot Statuses
-------

Slot 1
✅ This slot is perfectly evenly distributed

Slot 2
✅ This slot is perfectly evenly distributed

Slot 3
✅ This slot is perfectly evenly distributed
```

# Manually Changing the Topology

The most effective way I have seen to manually change the topology is:

1. Have at least two extra instances, always on different hosts and always in replica mode, which act as “extra” replicas
2. When you detect a topology issue, pick one of these instances and make it into a replica of the problematic hash slot. This will always be possible, since two different nodes have one replica each.
3. After the above, if both the “extra replicas” are on the same host, find any random hash slot which does not have an instance on that host (if none exist, find the one that is “most spread out” in terms of topology) and switch one of the “extra replicas” to a replica of this hash slot. Mark one of the replicas of this hash slot as the “extra”
4. Repeat until the topology is safe

![Untitled](/assets/img/posts/2024-01-01-redis-hash-slot-failure-via-topology/shuffling.png)

Note that we could have stopped at any time after the first step, since the immediate issue of single node failure has been solved.

One benefit of this mechanism is that the more “extra replicas” you add, the more you can swap topologies at the same time.

Note that if you have multiple “unsafe” hash slots on different machines, you can swap the replicas between them instead of swapping to the “extra replica” over and over.

How do you actually “swap” these replicas you ask? Surprisingly, this is the easiest step—we don’t even need a helper script:

```bash
# Run on the redis instance you want to change the status of
# This assumes that this instance is a replica - 
# if it is a master, this will fail unless it is empty
# if it is an empty master, it will change into a replica
# docs here: https://redis.io/commands/cluster-replicate/
CLUSTER REPLICATE <node id of master>
```

# Automatically Changing the Topology

This involves a two-step process - we need to monitor the Redis cluster’s topology for potentially risky topologies, and then decide to change the topology on the fly. This is a complex operation - you may want to consider other factors such as the current load on the cluster, the predicted load during the changing operation, and other business requirements. However, this is the most *exciting* part of this problem, so I’m taking a stab at it!

<More to come soon>