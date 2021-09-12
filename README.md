WEEKEND
 - Discussion parse
 - Re-parse all (<p> tag)
 - CSS
 - Finish text editor:  inline vs. full ; code ; link
 - Think about popularity -- score field on problem document?  Can run a worker to mass-update when we update equation
 - Profile page
 - Ideas/Roadmap page, upvote ideas/suggestions/features to order better
 - BUG: Preview -- ul/ol  off screen


TODO
 - Priority
   - Email verification
   - Materialize -> Tailwind
   - Mobile view, responsive
   - Transport problems: solution/title wrap in {{ }} for KaTex parts, use raw for remaining
   - Delete question
   - BUG: Add problem -- set category/level resets title
   - Text editor
        - Save (deflate); Edit
            - Katex -> {{ }}
        - Preview answers/title (in case of Katex)
        - TipTap components
            - horizontalBreak, hardBreak
            - link
        - inline vs. full
        - code


        - Image extension  drag/drop, move around
        - Table extension
        - KaTex extension
            - inline attribute + command to inline vs. block
            - renderHTML, parseHTML
            - Fix deleting inner content sometimes deletes entire node
        - @mention
        - text limit
        - BUG:  <tip-tap-form :value="getQuestionBody()" .../>  value gets set repeatedly rather than only once on init
        - Tooltip
        - Spellcheck
        - Embedded video (Youtube, upload)
        - Tailwind Styling on nodes: https://www.tiptap.dev/guide/styling
        - Keyboard shortcuts -- const CustomBulletList = BulletList.extend({ addKeyboardShortcuts() { return { 'Mod-l': () => this.editor.commands.toggleBulletList(), } }, })
        - Attributes parseHTML/renderHTML  -- https://www.tiptap.dev/guide/custom-extensions   (so you can copy/paste from textbox and retain attributes/nodes/etc.)
        - Typography extension: (c) -> ©
   - Problem parser
        - tiptap Image extension (zoomable; reference assets list for src)
        - Author age/location
        - Extract: date (inferred?), popularity (inferred), sections (problem/solution)
   - Discussion parser
   - Sort problems by hot/new, unsolved, discussions
   - Profile page:  click user and see list of problems
   - BUG: Can submit problem w/ no solutions; can leave 1st solution field empty
   - Vue cleanup: Add $ref to element to reference from inside Vue component; emit custom events from child -> caught by parent component + validation; provide/inject props from parent -> child component; v-bind:value vs. v-model
   - Hide solutions/discussion until question answered
   - BUG: Comment validation fail -- doesn't show validation fail from laravel (hidden element)   need to restore state
   - BUG: large solutions http://brilliant.jbud.me/brilliantexport/problems/10th-problem-2016/10th-problem-2016.html
   - BUG: Elements being inlined http://brilliant.laravel:8000/problem/41980  (first comment) ; http://brilliant.laravel:8000/brilliantexport/problems/00-5/00-5.html (question) ; http://brilliant.jbud.me/problem/280 (comment + question)
   - Inflate/Deflate
        - Merge sequential text paragraphs w/ \n
    - BUG: http://brilliant.laravel:8000/problem/81303  katex solution (centered vs. left)
    - BUG: blockquote next to pre/code gets merged http://brilliant.jbud.me/brilliantexport/problems/very-easy-2/very-easy-2.html
    - BUG: line breaks http://brilliant.laravel:8000/problem/10
    - Add question -> go to question page rather than /problems

    DOUBLE CHECK FROM LATEST
   - BUG: Links not showing properly http://brilliant.jbud.me/brilliantexport/problems/2015-countdown-problem-20-a-cubic-expansion-in-a/2015-countdown-problem-20-a-cubic-expansion-in-a.html
   - BUG: link *inside* heading/italics/strong: http://brilliant.jbud.me/brilliantexport/problems/2015-countdown-problem-20-a-cubic-expansion-in-a/2015-countdown-problem-20-a-cubic-expansion-in-a.html ; http://brilliant.jbud.me/brilliantexport/problems/10th-problem-2016/10th-problem-2016.html
   - BUG: orderedList/bulletList http://brilliant.laravel:8000/problem/10



   - Answer question component
   - Questions
        - Add/Edit question, check unique title  (NOTE: we may edit problem body but leave title the same, but then uniqueness fails)
        - Add/Edit question validation fail -- show validation fail on form, fill fields again
        - Add/Edit question Frontend validation
        - Add/Edit question include solutions
        - Validation fail -- store old() as JSON for vue, then set default value as either old value or default (current) value
    - Hide solution until answered
    - Show selected answer
    - README
    - Emoji react; Upvote
    - Cache busting
    - Report component
    - Archived view: disallow commenting on archived questions (question owners can unarchive?)
    - Prizes: emojis, gold coins, components (thematic horizontal rule), fonts





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

        source ~/.bashrc
        npm install
        # FIXME: migrate/seed but w/out deleting current docs
        npm run dev

        php artisan migrate:fresh --seed






   - Look into Vuex or data store model for cross-component communication
   - Profile page
   - Cache busting include css/js
   - Serve css/js -> public/ folder, SASS, Babylon
   - Production: strip out parts of css/js that aren't needed, tree shaking
   - Laravel caching  https://laracasts.com/series/laravel-8-from-scratch/episodes/10
   - Template sections of html (header file, footer file, etc.) for shared html
   - Notifications (someone replied to your comment)
   - Security, timer on question adding / commenting
   - Report questions, solutions, etc. ; Admin block users, questions, etc.
   - Question status:  verified, unsolved
   - Cleanup REST url, and naming conventions  show, index, create, store, edit, update, destory
   - Home/welcome page
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

