#!/bin/bash
function buildBlog() {
    local projectPath="/home/albert/remote-codespace/my-blog"
    local distPath="${projectPath}/.vitepress/dist"
    local targetPath="/opt/my-blog"

    pnpm build &&
    sudo rm -rf "${targetPath}/dist" &&
    sudo mv ${distPath} ${targetPath} &&
    sudo chown -R www-data:www-data "${targetPath}" &&
    sudo systemctl restart nginx &&
    echo "Build success"  
}

buildBlog