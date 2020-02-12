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
     |Canned|         +---------------+
     |Source+---------+-\  Backend    |           +--------------+
     +------+         | |  Server     |           |   Frontend   |
                      | |           /------------>+    webapp    |
     +------+         | \-->|src]--/  |           +--------------+
     | Live +---------+---->|mux|     |
     |Source|         +---------------+
     +---^--+
         |
         +
     bench-ds
```
## Source
a Source is an event generator that consumers can register callbacks against; you give it a function that consumes a Sample object and when new data arrives, that callback gets called with the new Sample data. 

### Canned source
For the canned sample event emitter, it just consumes a file of JSON that the
sandwich-load-gen.py script generates, and every 99ms just emits the next one in sequence.  Once the end is reached, it loops from the beginning again.

### Live source
For a live source, when ds-split or whatever sends us a sample, we just pass it downstream.

## Backend
the backend server registers a callback with a source that, for every sample, just sends it down a websocket.

## Frontend
the frontend client receives the Sample object over the wire and renders a visualization.

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

