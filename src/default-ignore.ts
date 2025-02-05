export const DEFAULT_IGNORE_PATTERNS = `
# avoid recursion
codefetch/

# Git
.git/**
**/.git/**
.gitignore
.gitattributes

# Version Control
.git/
.gitignore
.gitattributes
.svn/
.hg/

# Package Manager Files
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb
.npmrc
.yarnrc
.pnpmrc
.npmignore

# Project Config
.codefetchignore
.editorconfig
.eslintrc*
.eslintcache
.prettierrc*
.stylelintrc*
.tsbuildinfo
.prettierignore

# Binary and Image Files
# Images
*.png
*.jpg
*.jpeg
*.gif
*.ico
*.webp
*.bmp
*.tiff
*.tif
*.raw
*.cr2
*.nef
*.heic
*.heif
*.avif
*.svg
*.eps
*.ai
*.psd
*.xcf

# Videos
*.mp4
*.mov
*.avi
*.wmv
*.flv
*.mkv
*.webm
*.m4v
*.mpg
*.mpeg
*.3gp
*.3g2
*.ogv
*.vob

# Audio
*.mp3
*.wav
*.ogg
*.m4a
*.flac
*.aac
*.wma
*.aiff
*.mid
*.midi

# Documents and PDFs
*.pdf
*.doc
*.docx
*.xls
*.xlsx
*.ppt
*.pptx
*.odt
*.ods
*.odp
*.pages
*.numbers
*.key

# Archives and Compressed
*.zip
*.tar
*.gz
*.tgz
*.rar
*.7z
*.bz2
*.xz
*.lz
*.lzma
*.lzo
*.rz
*.lz4
*.zst
*.br
*.cab
*.iso
*.dmg
*.img

# Binary and Executable
*.exe
*.dll
*.so
*.dylib
*.bin
*.o
*.obj
*.lib
*.a
*.class
*.pyc
*.pyo
*.pyd
*.deb
*.rpm
*.pkg
*.app
*.sys
*.ko

# Database and Data Files
*.dat
*.db
*.sqlite
*.sqlite3
*.mdb
*.accdb
*.dbf
*.mdf
*.ldf
*.frm
*.ibd
*.idx
*.dmp
*.bak
*.bson

# Font Files
*.ttf
*.otf
*.woff
*.woff2
*.eot

# Model and 3D Files
*.fbx
*.obj
*.max
*.blend
*.dae
*.mb
*.ma
*.3ds
*.c4d
*.stl
*.glb
*.gltf

# IDE and Editor Files
.idea/
.vscode/
*.swp
*.swo
*.swn
*.bak

# Build and Cache
dist/
build/
out/
workspace-data/
.cache/
.temp/
tmp/
*.min.js
*.min.css

# NXT Files
*.nxt
.nxt/
.nxt-cache/
nxt-env.d.ts
nxt.config.*
.nxtrc
.nxt-workspace/

# Logs and Debug
*.log
debug.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment and Secrets
.env
.env.*
.env-*
*.env
env.*
*.pem
*.key
*.cert
*.secret
*.secrets
*secret*
*secrets*
*credential*
*credentials*
*password*
*passwords*
*token*
*tokens*

# Documentation
LICENSE*
LICENCE*
README*
CHANGELOG*
CONTRIBUTING*

# OS Files
.DS_Store
Thumbs.db
desktop.ini
`.trim();
