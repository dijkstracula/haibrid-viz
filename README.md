```
 _     _        _____ _           _     _           _       
| |   | |  /\  (_____) |         (_)   | |         (_)      
| |__ | | /  \    _  | | _   ____ _  _ | |___ _   _ _ _____ 
|  __)| |/ /\ \  | | | || \ / ___) |/ || (___) | | | (___  )
| |   | | |__| |_| |_| |_) ) |   | ( (_| |    \ V /| |/ __/ 
|_|   |_|______(_____)____/|_|   |_|\____|     \_/ |_(_____)
```                                                            

# Architecture

```
log.json
    +
    |
+---v--+ 
|Canned|         +---------------+  websocket  +----------+
|Source+---------+-+  Backend +--+------------>|  client  |
+------+         | |  Server  |  |             +----------+
                 | |          |  |
+------+         | +-->[src]--+  |  websocket  +----------+
| Live +---------+---->[mux]-----+------------>|  client  |
|Source|         +---------------+             +----------+
+---^--+
    |
    +
bench+ds

```
## Source
a Source is an event generator that consumers can register callbacks against; you give it a function that consumes a Sample object and when new data arrives, that callback gets called with the new Sample data. 

### Canned source
For the canned sample event emitter, it just consumes a file of JSON that the
sandwich-load-gen.py script generates, and every 99ms just emits the next one in sequence.  Once the end is reached, it loops from the beginning again.

### Live source
A live source is backed by a process, such as `./bench-ds | grep SAMPLE | socat`.  When this process receives the contents of a SAMPLE: macro, it passes it along in a similar
manner to all listeners on the backend.

## Backend
the backend server registers a callback with a source.  When a sample is received from
a source, it is fanned out over a websocket to all listening clients.

## Frontend
the frontend client is a web interface.  It receives Sample objects over the websocket and renders a visualization.

# Running

## Install Node

```
$ curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

## Install dependencies

```
$ npm run install
```

## Run

```
$ npm run dev
```

