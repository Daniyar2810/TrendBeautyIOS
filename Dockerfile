# Ýçinde Chrome ve Node.js hazýr olan Puppeteer imajý
FROM ghcr.io/puppeteer/puppeteer:latest

# Uygulama klasörünü oluþtur ve çalýþma dizini yap
WORKDIR /usr/src/app

# Yetki sorunlarýný önlemek için root kullanýcýsýna geç
USER root

# Önce sadece paket dosyalarýný kopyala (önbellekleme için)
COPY package*.json ./

# Baðýmlýlýklarý kur
RUN npm install

# Geri kalan tüm proje dosyalarýný kopyala
COPY . .

# Render'ýn kullandýðý portu tanýmla
ENV PORT=10000
EXPOSE 10000

# Uygulamayý baþlat
CMD [ "node", "server.js" ]