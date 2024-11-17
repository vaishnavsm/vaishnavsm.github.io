---
title: How Many TCP Connections Can You Make?
subtitle: Tackling a classical TCP interview question beyond just theory
layout: post
tags: ['Tech', 'Networking']
---
{% assign media_url = "/assets/img/posts/2024-06-08-how-many-tcp-connections"  %}
{% assign github_blog_uri = "https://github.com/vaishnavsm/blog-tcp-connection-limit"  %}

To put it in standard interview format,

```
Given n machines with m ports each, how many TCP connections can be made theoretically from one to the other?
```

## Thinking up an answer

### The "simple logic"
For those familiar with the socket analogy, it's easy to come up with a plausible answer.

![a simple analogy]({{media_url}}/1.svg){: style='max-height: 300px;' .centered }
If you had two machines with `m` ports on each, you can make `m` "connections" (think connecting an electrical plug to a socket).

![maximizing socket use]({{media_url}}/2.svg){: style='max-height: 300px;' .centered }
You may even think of a clever scheme for more than two machines, where you can use all the available sockets but one in one connection each, giving you `floor(mn/2)` possible connections between `n` machines with `m` connections each.

Given some elementary knowledge of TCP, you would know that ports on a standard linux machine go from `1-65535`, giving you `m = 65535`, and voila, you have an answer!


### Hmm, what about servers, though?
You notice that the limiting factor in your connection count is that each socket can either make one connection or receive one connection, and that you have reached the highest possible answer in this paradigm. This is when you remember that a server can listen to multiple requests on a single TCP port!

You try to remember if this happened by opening a new connection for each new request, or if there's something else ongoing. You seem to remember that each time a socket accepts a connection, a `file descriptor` is created. This isn't a socket. You note down that you've gotta go read more about file descriptors later, but for now, time to tackle the original question!

![servers!]({{media_url}}/3.svg){: style='max-height: 300px;' .centered }
You easily think of a way to reach `m * (n-1)` connections, just by making a connection from every port on every machine to one "server" machine. Is this it? No.

![maximizing socket use v2]({{media_url}}/4.svg){: style='max-height: 300px;' .centered }
You realise that the ports on the "server" are just sitting there unused. With a bit of thought, you figure out that you can sacrifice one port on another machine to create a server, to which the "free" ports on the original server can connect. With that, you have all possible connections you think, except for two ports that can't make outbound connections because there are servers listening on them. `mn - 2`. There can't be more. Right?

## Ok, but what's the answer?

You're pretty happy with your answer. But you want to be sure. Maybe it's possible two more connections to get the full `mn` connections, and you've missed something minor. Those last two connections are the difference between someone who can think of good answers and someone who knows answers, you muse.

You hit up your favorite online Q&A site, and find the answer:

![the answer]({{media_url}}/answer.svg){: style='max-height: 300px;' .centered }
`m^2 * n^2`.

What?

_How_ is that even possible?

### The answer, in theory

If you go searching around at all, you will find the mantra of disambiguating a TCP connection:
```
A TCP connection is
identified by the 5-tuple of
(
  protocol,
  source ip,
  source port,
  destination ip,
  destination port
)
```

Taking this as gospel, it is clear how we get to the `m^2*n^2` figure: we just multiply through by each of the 4 variable parts in turn (`protocol` is assumed to be fixed to TCP).

This is, to me, both highly intuitive as well as kind of weird.

It is intuitive as that's how connections are tracked anywhere we deal with TCP. It's how TCP connections are thought of when setting up `iptables` rules; it's how TCP connections are thought of during `tcpdump`; it's how TCP connections are set up when binding them to sockets.

It's kind of weird because we never think of TCP this way when writing apps. When we write a server-client application, we almost always assume the clients socket belongs exclusively to the server. This is something lost in the abstraction between L4 and L7, and possibly rightfully so! The client handles the port sharing on its end, and that's something we don't have to care about on the server, so why think about it at all?

Given you may never have seen this in the wild though, you may ask:

### But is that even actually possible?
_PS: Please go to [this repo]({{github_blog_uri}}) for instructions on how to run this yourself. Things feel a lot more real if you actually run these yourself!_

As a matter of fact, yes it is!
To prove that this is possible, we need to show that if we change any of the four parameters in `(source ip, source port, destination ip, destination port)`, we can create a new connection. Out of these, a few are trivial:

1. If you change `source ip`, it's equivalent to connecting from a different machine, so there's not much to test out there.
1. If you change `source port`, it's equivalent to a "new connection" on the same machine, so there's nothing to test out there either.

These are situations where different clients connect to the same server.

What we are left to prove is:
1. Given a fixed `(source ip, source port, destination ip)`, we can connect to multiple `destination ports`.
1. Given a fixed `(source ip, source port, destination port)`, we can connect to multiple `destination ips`.

These are situations where the same "socket" (ie `source ip, source port` pair) make a connection to two different servers. In a way, it's the opposite of how a server accepts connections from multiple clients.

#### Test Setup
We have a server and a client

Importantly, the client creates a socket with the `SO_REUSEADDR` option set. This allows multiple clients to connect to the same `(source ip, source port)` combo.

#### Testing for multiple destination ports
We spin up two listeners on two different ports (6001 and 6002), and spin up two connectors on the same port (6000), fixing all ips on loopback.

![multiple destination port demo]({{media_url}}/diffport.png){: .centered }
Success! Both the servers are getting requests from `127.0.0.1:6000`, but they have different data being echoed back!

#### Testing for multiple destination ips
We spin up two listeners on two different ips (loopback and local lan ip) but the same port, and spin two connectors on the same port (6000).

![multiple destination ip demo]({{media_url}}/diffips.png){: .centered }
Success! Both the servers are getting requests from `127.0.0.1:6000`, but they have different data being echoed back again!

_You may want to [play around]({{github_blog_uri}}) with interesting cases yourself! Some suggested experiments are included in the README over on Github._

## Practical Considerations

Let's punch in some numbers.

```
n = ip space ~ 2 ^ 32
m ~ 2 ^ 16

total number of connections =  ( 2 ^ 32 * 2^16 ) ^ 2 = 2^96 ~ 8*10^28
ie, possible total number of connections = 80 billion billion billion
```

Of course, that's not practically possible. You will run into other limitations far before you reach anything close to that number.

Some of them are:
1. The number of connections your CPU can handle, especially given TLS today
2. The number of file descriptors that can be open at a time (`ulimit`)
3. The number of file descriptions that you can store in memory
4. The time needed to open that many connections 🤣

However, this is more meant to be a theoretical explanation, so let's leave it at that!
