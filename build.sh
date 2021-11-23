#! /bin/bash

cd _jekyll
jekyll build && cp -r _site/* ../
