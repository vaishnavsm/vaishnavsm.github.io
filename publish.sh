if [ "$1" != "" ]; then
        bundle exec jekyll build && git add -A && git commit -m "$1" && git push origin master && cd _site &&git add -A && git commit -m "$1" && git push origin master && cd ..
    else
        echo "Please Provide A Commit Message!"
    fi
