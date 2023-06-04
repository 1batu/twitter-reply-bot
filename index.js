import axios from "axios";
import Twit from "twit";
import 'dotenv/config';

function getKeyword() {
    // gündemde bulunan veya bulunmasını istediğiniz aratacağınız anahtar kelimeler
    const keywords = [
        "@1ncibatu",
        "@216GPT",
        "@elonmusk",
        "galatasaray",
        "fenerbahce",
        "türkiye",
        "ekonomi",
        "siyaset",
        "tatil",
        "öğrenci",
        "sınav",
        "elektrik",
        "fatura",
        "zam"
    ];

    const index = Math.floor(Math.random() * keywords.length);
    return keywords[index];
}

const api = new Twit({
    consumer_key: process.env.tConsumerKey,
    consumer_secret: process.env.tConsumerSecret,
    access_token: process.env.tAccessToken,
    access_token_secret: process.env.tAccessTokenSecret,
});

async function searchAndComment() {

    console.log("Tweetler aranıyor...");

    // const tweetText = '@1ncibatu Merhaba! Sana etiketli bir tweet atıyorum. 😊';

    // await api.post('statuses/update', { status: tweetText }, (err, data, response) => {
    //     if (err) {
    //         console.log('Tweet gönderme hatası:', err);
    //     } else {
    //         console.log('Tweet başarıyla gönderildi!');
    //     }
    // }); // Test etmek için çalıştırabilirsiniz. 

    const query = `${getKeyword()}`;
    const maxTweets = 5; // aramak istediğiniz twit sayısı

    const { data: searchResults } = await api.get("search/tweets", {
        q: query,
        count: maxTweets,
    });

    console.log(
        `${searchResults.statuses.length} bulundu. Yorum yapılıyor...`
    );

    for (const tweet of searchResults.statuses) {
        const { data: response } = await axios.post(
            "https://api.openai.com/v1/completions",
            {
                model: "text-davinci-003",
                prompt: `Bu tweet'e yorum yapın: "${tweet.text}", bu tweet'e verilecek yanıt benim yazdığım gibi olmalı ve oluşturulan metinle eşleşen bazı emojiler de içermeli`,
                max_tokens: 70,
                temperature: 0.5,
                top_p: 1,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.openaiApiKey}`,
                },
            }
        );

        const comment = response.choices[0].text;
        console.log(comment);

        const { data: postResponse } = await api.post("statuses/update", {
            status: `@${tweet.user.screen_name} ${comment}`,
            in_reply_to_status_id: tweet.id_str,
        });
        console.log(`Comment posted: ${postResponse.text}`);

        // 30 dakikada bir çalışacak şekilde ayarlı.
        await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000));
    }
    searchAndComment();
}

searchAndComment();

