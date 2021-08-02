TODO
 - Priority
   - Problem answering component - (answer question, hide solution until answered, show selected answer)
   - Email verification
   - Text component / Markdown
   - Materialize -> Tailwind
   - Problem parser
   - Discussion parser
   - Sort problems by hot/new, unsolved, discussions
   - Profile page:  click user and see list of problems
   - BUG: "0 Solutions"
   - BUG: Can submit problem w/ no solutions; can leave 1st solution field empty
   - BUG: Edit comment -- show initial value of existing comment



 - Restructure
   - Template page + Vue/Materialize for problem + discussion; KaTex
        - Tiptap text component (full + stripped for comment vs. problem ; preview)
        - Generate KaTex for math
        - Generate code for code snippets
        - Genrete html from template:  blockquote ``` , bold ** , italics __ , images, etc.
        - Get raw input (for form submission)
   - Cleanup
        - Text component (full for problem, inline/small for short replies)
        - Preview/Markdown/KaTex viewer (problem, comments, preview for problem)

        - Emoji react component
        - Upvote component
        - Report component
        - Answer question component
        - Mix setup: watch, hotload, faster compile, cache busting, etc.
   - Questions
        - Add/Edit question, check unique title  (NOTE: we may edit problem body but leave title the same, but then uniqueness fails)
        - Add/Edit question validation fail -- show validation fail on form, fill fields again
        - Add/Edit question Frontend validation
        - Add/Edit question include solutions
        - Validation fail -- store old() as JSON for vue, then set default value as either old value or default (current) value


        - Hide solution until answered
        - Show selected answer
        - Emoji react
        - Upvote
    - Parser
        - Extract body, discussion in raw html of entire section -> raw.json
        - Follow-up parser to run through raw.json and parse html
    - README

        == Install ==

        # Setup Composer
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        php -r "if (hash_file('sha384', 'composer-setup.php') === '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
        php composer-setup.php
        php -r "unlink('composer-setup.php');" composer

        # Install laravel
        composer create-project laravel/laravel brilliant

        # Git clone
        git clone https://github.com/Jbudone/brilliant brilliant.temp
        rsync -a brilliant.temp/ brilliant
        rm -r brilliant.temp

        # Setup env
        create database: brilliant
        npm install
        vim .env

        # Build DB, seed
        php artisan migrate:fresh --seed

        # Mix assets
        npm run dev

        # localserver server host
        php artisan server --host=brilliant.local

        # live server, edit .htaccess to redirect to public
            RewriteEngine on
            RewriteCond %{REQUEST_URI} !^public
            RewriteRule ^(.*)$ public/$1 [L]




        == Update ==
        git pull
        npm install
        # FIXME: migrate/seed but w/out deleting current docs
        npm run dev




   - Email verification, emailing
   - Look into Vuex or data store model for cross-component communication
   - Solution: non-multiple choice, images, latex
   - Fix "[Vue warn]: Invalid VNode type: Symbol(Fragment) (symbol)"  warning -- Vue loaded twice, temp solved by exporting Vue from app.js
   - Profile page
   - Cache busting include css/js
   - Serve css/js -> public/ folder, SASS, Babylon
   - Production: strip out parts of css/js that aren't needed
   - FIXME's: CSS + JS
   - Laravel Mix
   - Laravel caching  https://laracasts.com/series/laravel-8-from-scratch/episodes/10
   - Template sections of html (header file, footer file, etc.) for shared html
   - Notifications (someone replied to your comment)
   - Security, timer on question adding / commenting
   - Report questions, solutions, etc. ; Admin block users, questions, etc.
   - Question status:  verified, unsolved
   - Cleanup REST url, and naming conventions  show, index, create, store, edit, update, destory
   - Home/welcome page


 - Parse problems
    - Extract: date (inferred?), popularity (inferred), sections (problem/solution)
    - Problem UID
 - Show discussions
 - Show unsolved problems
 - Hide solutions (until you solve)
 - Hover question to see preview
 - Cleanup page / blank space
 - CSS test across browsers, cleanup



Listed problems for parser
http://jbud.me/playground/brilliant/problems/15-points/15-points.html
http://jbud.me/playground/brilliant/problems/1088-2/1088-2.html
http://jbud.me/playground/brilliant/problems/108th-problem-2016/108th-problem-2016.html
https://brilliant.org/problems/113th-problem-2016/?ref_id=1236678#post-146424
https://brilliant.org/problems/0-and-1-in-exponents/
http://brilliant.local/problems/1-in-5-americans-2/1-in-5-americans-2.html
http://brilliant.local/problems/the-kingdom-of-chemithia-part-6/the-kingdom-of-chemithia-part-6.html
http://brilliant.local/problems/117th-problem-2016/117th-problem-2016.html
http://brilliant.local/problems/1614/1614.html
http://brilliant.local/problems/1-5/1-5.html
http://brilliant.local/problems/100-gold-coins/100-gold-coins.html
http://brilliant.local/problems/11-is-really-lovely-well-bring-it-everywhere/11-is-really-lovely-well-bring-it-everywhere.html
http://brilliant.local/problems/0-and-1-in-exponents/0-and-1-in-exponents.html
http://jbud.me/playground/brilliant/problems/0-and-1-in-exponents/0-and-1-in-exponents.html


References
https://web.archive.org/web/20210617023042/https://brilliant.org/community/home/problems/popular/all/all/?no_js=true
https://web.archive.org/web/20210617031230/https://brilliant.org/discussions/thread/simpler-solution-of-mechanics-warmups-level-4/
https://www.commonsense.org/education/sites/default/files/experience-media-file/brilliant_10.png?width=660&height=415&iframe=1&slide=9&scalePhotos=1
https://www.commonsense.org/education/sites/default/files/experience-media-file/brilliant_9.png?width=660&height=415&iframe=1&slide=8&scalePhotos=1
https://www.commonsense.org/education/website/brilliant

