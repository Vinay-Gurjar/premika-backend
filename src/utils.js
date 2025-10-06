const resolvePromise = async (promise) => {
    try {
        return await promise;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error to propagate it
    }
};

const getRandomAvatar = () => {
    const avatars = [
            "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:02:50.489Z/158zV9CbhVVThjwoVnMZpd/1.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:04:51.947Z/9M4hdzzwaY31yMdsWM19Gc/2.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:06:04.381Z/pDT5KtDFfcjfT6Zv4XARHg/3.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:07:13.007Z/iJH1VcFKL8s62UBvkRp9GS/4.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:08:03.953Z/vETcuK2Qxtvrjtxz2mYawv/5.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:09:09.469Z/oWwqTPj5cgmKjMN3bHJuUh/6.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:11:19.359Z/ndth8oDRKkiRTzhEEGAq5i/7.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:12:23.159Z/upuuLNDtTVaRRxgKX6Vqkm/8.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:13:12.082Z/3QNxqDupzT9S2L1dzaXX9H/9.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:14:19.936Z/2axHKNdV6nEk1djHk81PJy/10.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:15:13.817Z/kKtrN8xoAeu7YcY63qAP2C/11.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:16:04.258Z/v4DhZtVdRYu1DXk15NGWtY/12.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:10:16.335Z/fru7JhZ74a1JhYhjwKkiH2/13.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:18:03.207Z/261NFNRBDe4VFugCu7aHm6/142.png",
    "https://baatein.s3.ap-south-1.amazonaws.com/document/profile_image/2025-10-01T11:17:15.177Z/vNsrhMjvXYh2JspDhnrGjX/15.png"   
    ]
    return avatars[Math.floor(Math.random() * avatars.length)];
}


export {
    resolvePromise,
    getRandomAvatar
}