#!/bin/bash

ls *.json | while read file
do
	curl localhost:8080/groups/new --data @${file} -H "Content-Type: application/json"
done
