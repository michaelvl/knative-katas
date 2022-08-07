import http from "k6/http";

export default function() {
    let response = http.get("http://sentences.default.192.168.122.220.sslip.io:80");
};
