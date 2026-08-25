const fs = require('fs');
const files = ['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', 'advertise.html', 'compiler.html'];
files.forEach(f => {
    let content = fs.readFileSync('C:/Users/Hp/Desktop/Compilers/frontend/' + f, 'utf8');
    // Order matters! Replace compiler.html?lang=web -> /html-compiler before compiler.html
    content = content.replace(/compiler\.html\?lang=python/g, '/python-compiler');
    content = content.replace(/compiler\.html\?lang=web/g, '/html-compiler');
    content = content.replace(/compiler\.html/g, '/html-compiler'); // default open editor link

    content = content.replace(/about\.html/g, '/about');
    content = content.replace(/contact\.html/g, '/contact');
    content = content.replace(/privacy\.html/g, '/privacy');
    content = content.replace(/terms\.html/g, '/terms');
    content = content.replace(/advertise\.html/g, '/advertise');
    content = content.replace(/index\.html/g, '/');

    fs.writeFileSync('C:/Users/Hp/Desktop/Compilers/frontend/' + f, content);
});
console.log('Update complete!');
