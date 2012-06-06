package main

import (
    "time"
    
    "io"
    "io/ioutil"
    "net/http"
    "os"
    "os/exec"
    
    "log"
    "fmt" 
    "encoding/json"

    "runtime"
    "flag"
    //"reflect"
)

var Mapper interface {

}

var numCores = flag.Int("n", runtime.NumCPU(), "number of CPU cores to use")

var basePath, pwdError = os.Getwd()

var mainPage = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>goclubby test page</title>
<script type="text/javascript" src="/file1.js"></script>
<script type="text/javascript" src="/file2.js"></script>
<script type="text/javascript" src="/file3.js"></script>
</head>
<body>
<b>
Open up console and test
</b>
</body>
</html>
`

func readResource(filePath string, out chan string, minify bool) {

    if minify {
        // get the minified byte data using closure compiler
        resourceData, err := exec.Command("java", "-jar", 
                                          "closure/compiler.jar", 
                                          "--compilation_level", 
                                          "WHITESPACE_ONLY",
                                          "--js", filePath ).Output()
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

func concatResource(in chan string, numFiles int) (minifiedFile string){
    count := 0

    for resourceString := range in {
        count = count + 1
        minifiedFile = minifiedFile + resourceString
        
        if count == numFiles {
            // close the channel so that for-loop stops 
            // listening for incoming items and breaks the loop 
            close(in)
        }
    }

    return 
}

func serverInit(w http.ResponseWriter, req *http.Request) {
    w.Header().Set("Server", "goclubby/0.1")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Content-Type", "application/javascript")
    // same channel is used for communication between
    // readResource goroutine and writeResource function
    recv := make(chan string)

    path := (*req.URL).Path
    mapping := Mapper.(map[string]interface{})
    temp := (mapping[path]).([]interface{})
    var numFiles int
    for k, v := range temp {
        numFiles = k
        fileSlice := v.(map[string]interface{})
        for filePath, _ := range fileSlice {
            // create a goroutine on every I/O operation so that
            // multiple I/O operations happen in parallel
            go readResource(basePath + filePath, recv, false)    
        }
    }

    io.WriteString(w, concatResource(recv, numFiles + 1) + "\n")
    fmt.Printf("Request- %s %s\n", req.URL, time.Now())
}

func MainPage(w http.ResponseWriter, req *http.Request) {
    w.Header().Set("Server", "goclubby/0.1")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Content-Type", "text/html; charset=iso-8859-1")
    io.WriteString(w, mainPage)
}

func readConfig() {
    // read configuration from mapping.json
    mappingData, err := ioutil.ReadFile("mapping.json")
    if err != nil {
       fmt.Printf("Error occured in %s\n", err)
    }
    //fmt.Printf("Mapping json: %s\n\n", mappingData)

    // decode json to Mapping data structure in go
    err = json.Unmarshal(mappingData, &Mapper)
    if err != nil {
       fmt.Printf("Error occured in %s\n", err)
    }

    //fmt.Printf("Resource Mapping: %#v\n\n", Mapper.(map[string]interface{}))
}

func main() {

    // make sure app uses all cores
    flag.Parse()
    runtime.GOMAXPROCS(*numCores)

    readConfig()

    fmt.Printf("goclubby server running at " +
               "http://0.0.0.0:8000 on %d CPU cores\n", *numCores)

    http.HandleFunc("/", MainPage)
    http.HandleFunc("/file1.js", serverInit)
    http.HandleFunc("/file2.js", serverInit)
    http.HandleFunc("/file3.js", serverInit)
    err := http.ListenAndServe("0.0.0.0:8000", nil)
    if err != nil {
        log.Fatal("In main(): ", err)
    }
}