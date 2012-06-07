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

type Resource struct {
    resourceData []byte
    order          int
}

var compilationLevel = map[int]string{1: "WHITESPACE_ONLY",
                                      2: "SIMPLE_OPTIMIZATIONS",
                                      3: "ADVANCED_OPTIMIZATIONS"}

var numCores = flag.Int("n", runtime.NumCPU(), "number of CPU cores to use")

var basePath, _ = os.Getwd()

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

func readResource(out chan *Resource, filePath string, minify int, order int) {
    var msg *Resource = new(Resource)
    
    if minify == 0 {
        // read the byte data normally
        resourceData, err := ioutil.ReadFile(filePath)
        if err != nil {
           fmt.Printf("In %s file, Error occured\n", filePath)
        }

        (*msg).resourceData = resourceData
    } else {
        // get the minified byte data using closure compiler
        resourceData, err := exec.Command("java", "-jar", 
                                          "closure/compiler.jar", 
                                          "--compilation_level", 
                                          compilationLevel[minify],
                                          "--js", filePath ).Output()
        if err != nil {
            log.Fatal(err)
        }

        (*msg).resourceData = resourceData
    }

    (*msg).order = order

    out <- msg
}

func concatResource(in chan *Resource, numFiles int) (minifiedFile string){
    count := 0

    for resource := range in {
        count = count + 1
        minifiedFile = minifiedFile + string(resource.resourceData)
        
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
    var numFiles int
    // same channel is used for communication between
    // readResource goroutine and writeResource function
    recv := make(chan *Resource)

    mapping := Mapper.(map[string]interface{})
    temp := (mapping[req.URL.Path]).([]interface{})
    for order, v := range temp {
        numFiles = order
        fileSlice := v.(map[string]interface{})
        for filePath, minify := range fileSlice {
            // create a goroutine on every I/O operation so that
            // multiple I/O operations happen in parallel
            go readResource(recv, basePath + filePath, int(minify.(float64)), order)
        }
    }

    io.WriteString(w, concatResource(recv, numFiles + 1) + "\n")
    fmt.Printf("Response sent- %s %s\n", req.URL, time.Now())
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