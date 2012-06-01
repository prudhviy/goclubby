package main

import (
    "time"
    
    "io"
    "io/ioutil"
    "net/http"
    
    "log"
    "fmt" 
    
    "runtime"
    "flag"
)

var numCores = flag.Int("n", runtime.NumCPU(), "number of CPU cores to use")

var files = [2]string{"tests/a.js", "tests/b.js"}

func readResource(path string, out chan string) {
    
    buf, err := ioutil.ReadFile(path)
    if err != nil {
	   fmt.Printf("In %s file, Error occured\n", path)
    }

    out <- string(buf)
}

func concatResource(in chan string, numFiles int) (minifiedFile string) {
    count := 0
    var temp string

    for fileContent := range in {
        temp = fileContent
        minifiedFile = minifiedFile + temp
        count = count + 1
        if count == numFiles {
            close(in)
        }
    }

    return 
}

func serverInit(w http.ResponseWriter, req *http.Request) {
    fmt.Printf("Request- %s %s\n", req.URL, time.Now())

    recv := make(chan string, len(files))
    for _, path := range files {
        go readResource(path, recv)
    }
    minifiedFile := concatResource(recv, len(files))

    w.Header().Set("Server", "goclubby")
    io.WriteString(w, minifiedFile + "\n")
}

func main() {

    // make sure app uses all cores
    flag.Parse()
    runtime.GOMAXPROCS(*numCores)

    fmt.Printf("goclubby server running at http://0.0.0.0:8000 on %d CPU cores\n", *numCores)

    http.HandleFunc("/", serverInit)
    err := http.ListenAndServe("0.0.0.0:8000", nil)
    if err != nil {
        log.Fatal("In main(): ", err)
    }
}
