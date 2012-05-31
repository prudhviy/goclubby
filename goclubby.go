package main

import (
    "time"
    "io"
    "net/http"
    "log"
    "fmt" 
    "runtime"
    "flag"
)

var numCores = flag.Int("n", runtime.NumCPU(), "number of CPU cores to use")


func server_init(w http.ResponseWriter, req *http.Request) {
    fmt.Printf("Request- %s %s\n", req.URL, time.Now())
    io.WriteString(w, "hello world!\n")
}

func main() {

    // make sure app uses all cores
    flag.Parse()
    runtime.GOMAXPROCS(*numCores)

    fmt.Printf("goclubby server running at http://0.0.0.0:8000 on %d CPU cores\n", *numCores)

    http.HandleFunc("/", server_init)
    err := http.ListenAndServe("0.0.0.0:8000", nil)
    if err != nil {
        log.Fatal("In main(): ", err)
    }
}
