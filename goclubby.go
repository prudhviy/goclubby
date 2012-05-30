package main

import (
	"time"
	"io"
	"net/http"
	"log"
	"fmt"
)

func server_init(w http.ResponseWriter, req *http.Request) {
	fmt.Printf("Request- %s %s\n", req.URL, time.Now())
	io.WriteString(w, "hello world!\n")
}

func main() {
	fmt.Printf("goclubby server running at 0.0.0.0:8000\n")
	http.HandleFunc("/", server_init)
	err := http.ListenAndServe("0.0.0.0:8000", nil)
	if err != nil {
		log.Fatal("In main(): ", err)
	}
}
