docker-compose:

    docker-compose up -d

build:
    docker build -t alyzee/projet_final .

run:
    docker rm -f luminapay || true
    docker run -p 3000:3000 --name luminapay hindblgcm/luminapay

ssh : 
    ssh alyzee@51.91.208.111