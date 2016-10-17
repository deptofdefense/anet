#!/bin/bash

ls *.json | while read file
do
	curl localhost:8080/people/new --data @${file} -H "Content-Type: application/json"
done
