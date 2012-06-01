package main

import (
    "time"
    
    "io"
    "io/ioutil"
    "net/http"
    "os/exec"
    
    "log"
    "fmt" 
    
    "runtime"
    "flag"
)

var numCores = flag.Int("n", runtime.NumCPU(), "number of CPU cores to use")

var files = [2]string{"tests/a.js", "tests/b.js"}
var basePath = "/home/prudhviy/work/goclubby/"

func readResource(filePath string, out chan string, minify bool) {

    if minify {
        // get the minified byte data using closure compiler
        resourceData, err := exec.Command("java", "-jar", "closure/compiler.jar", "--js", filePath ).Output()
        if err != nil {
            log.Fatal(err)
        }

        out <- string(resourceData)

    } else {
        // read the byte data normally
        resourceData, err := ioutil.ReadFile(filePath)
        if err != nil {
           fmt.Printf("In %s file, Error occured\n", filePath)
        }

        out <- string(resourceData)
        
    }
}

func concatResource(in chan string, numFiles int) (clubbedFile string) {
    count := 0

    for resourceData := range in {
        clubbedFile = clubbedFile + resourceData
        count = count + 1
        
        if count == numFiles {
            // close the channel so that for loop stops 
            // listening for incoming items and breaks the loop 
            close(in)
        }
    }

    return 
}

func serverInit(w http.ResponseWriter, req *http.Request) {
    fmt.Printf("Request- %s %s\n", req.URL, time.Now())

    // same channel is used for communication between
    // readResource goroutine and concatResource function
    recv := make(chan string, len(files))

    for _, filePath := range files {
        // create a goroutine on every I/O operation so that
        // multiple I/O operations happen in parallel
        go readResource(basePath + filePath, recv, true)
    }

    minifiedFile := concatResource(recv, len(files))

    w.Header().Set("Server", "goclubby/0.1")
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
