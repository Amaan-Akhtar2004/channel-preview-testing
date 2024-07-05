/** @type {import('next').NextConfig} */
const nextConfig = {
    // for the error while importing puppeteer in the routes
    experimental: {
        serverComponentsExternalPackages: [
        "puppeteer-extra",
        "puppeteer-extra-plugin-stealth",
        "puppeteer-extra-plugin-recaptcha",
        ],
    },
};

export default nextConfig;
