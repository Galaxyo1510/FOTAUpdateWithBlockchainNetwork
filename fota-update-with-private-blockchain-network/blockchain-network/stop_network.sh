echo "######################################################"
echo "#########  Down Running Network ######################"
echo "######################################################"
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml -f docker-compose-ca.yaml down --volumes --remove-orphans
rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config ./org3-artifacts/crypto-config/ channel-artifacts/org3.json
docker rm $(docker ps -aq)  
docker rmi $(docker images dev-* -q)