if [ "$1" != "" ]; then
  rm -r _site/*
  cd _site
  git add -A
  git commit -m "Clearing Site"
  cd ..
  gulp
  if [ $? != 0 ]; then
    echo "Gulp Failed. Please Check Gulp!"
    return 2
    exit
  fi
  bundle exec jekyll build
  if [ $? != 0 ]; then
    echo "Build Failed. Please Check The Build!"
    return 1
    exit
  fi
  git add -A
  git commit -m "$1"
  git push origin master
  cd _site
  git add -A
  git commit -m "$1"
  git push origin master
  cd ..
else
  echo "Please Provide A Commit Message!"
fi
