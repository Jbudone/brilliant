TODO (archive-only)
 - get online w/out :8080
 - Remove non-archive things (adding new questions/etc.)
 - Problems / Needs Solutions / Discussions
 - Typesearch
 - Faster startup

   - Cache busting include css/js
   - Serve css/js -> public/ folder, SASS, Babylon
   - Production: strip out parts of css/js that aren't needed, tree shaking
   - Laravel caching  https://laracasts.com/series/laravel-8-from-scratch/episodes/10
   - Template sections of html (header file, footer file, etc.) for shared html
   - Hover question to see preview



OLD TODO
 - Finish text editor:  code ; link
 - Think about popularity -- score field on problem document?  Can run a worker to mass-update when we update equation
 - CSS Links, buttons
 - Text CSS cleanup: http://brilliant.laravel:8000/brilliantexport/discussions/thread/recursive-subsets-of-mathbbn-and-finite-model/recursive-subsets-of-mathbbn-and-finite-model.html
 - Merge/zip/unzip discussions for faster scp -> server
 - Webworkers for parsing?
 - Microsoft Edge rendering issue on buttons
 - Webpack cleanup: cache busting css/js, strip vendor, tree shaking, etc.
    - cache busting: need to store all js/css in resources and specify for building?
 - Problem JSON -> HTML -> inject Tailwind classes into elements rather than using app.css
 - Laravel packages: Fortify (authentication)? Socialite (OAuth); Sanctum; Telescope
 - FIXME: Check tableCell rework (as container) is fine
 - FIXME: external img src http://brilliant.laravel:8000/problem/106736 
 - BUG: "View Solutions" -- don't say "YOu guessed ."
 - BUG: Adding empty problem
 - BUG: Forget to set title/category/level on problem and it goes back w/out putting solution/text back
 - BUG: \[ \] and \{ \} don't work for text editor
 - Use events/listeners to split logic for votes/reports
 - @mentions use search service for searching users names
    - Queue Driver for Scout https://laravel.com/docs/8.x/queues + enable .env SCOUT_QUEUE
    - Update Typesense driver when ready: https://github.com/typesense/laravel-scout-typesense-driver
    - Only include necessary parts of documents (user name/created, problem title/created)
    - InstantSearch.js?
    - Typesense command to create/seed from database; start Typesense service?
    - API search request from routes/web.php
    - Tiptap @mentions extension + modify for this
 - ReCaptcha v3
 - Interactable check response from server (Throttled -> show error popup?)
 - Security
    - <form>  includes non-input elements (are those getting sent over?)
    - XSS attack via manual submission?  -- titles/solutions?
 - Throttling posts on success vs. failed  (eg. post -> fail validation -> try to fix -> fail again -> repeat until throttled)
 - AJAX request throttled -> dialog

 * Comment Rework
    - Can reply multiple times
    - Can add solutions multiple times
    - Nuke jquery
    - Interactions
    - CSRF axios

 - Search posts (by title)
 - List discussions, problems, unsolved (check?), hot/popular

 - Admin
    - Reports/etc. notifications show up here for approval
    - Answered reports/etc. show up (readonly)
    - Notifcations of new report
    - Blade @admin  or  @level(3)
    - Admin: view profile -> change role (or ban/silence)
    - Admin Page: see activity
    - Auto level up users
    - Admins
        - Level 0: delete/edit posts + comments; admin page; add "Admin note"; undo admin changes    (personally added)    @admin   @auth('admin')
        - Level 1: simulate delete/edit posts + comments, undo admin changes, give badges   (moderator, requested for mod, all simulates approved/committed by admins)    @moderator   @auth('moderator')
        - Level 2: flag/report; admin page, bounties (spend points on questions), mark solution as correct (limited access), add new tag    (power user, min points gained -- marked as correct OR badges; can be taken away)     @poweruser   @auth('poweruser')
        - Level 3: upvote/downvote    (basic user 2, min points gained)       @usernormal
        - Level 4: ask question, add comment      (basic user, time based)    @userbasic
        - Level 5: silenced/suspended

 - Interactions
    - Upvote/Downvote (comment, problem)
    - Star (problem), Bounty (problem), Silver/Gold coin (on comment/problem), Badges (user), Follow (user, tag)
    - Flag/Report (problem, comment)
    - Admin: hide comment/problem, suspend user

    DB Schema
    votes { user, post, isupvote, comment (nullable) }  # upvote/downvote  either problem or comment
    admin_events { issue_id,  ..... }   # events that you can reverse (eg. editing problem) ; issue_id is for multiple events on the same issue
    stars { user, post }
    coins { user, post, comment (nullable), coin }
    users { ..., badges: largeint-bitfield, stars, coins, points }  # stars/coins are how many you have
    problems { ..., has_stars, has_coins }  # has_stars/coins for fast first-pass check
    follows ????
    reports { user, post, comment (nullable), reason }
    activity_events { .... }  # simple events that happened (star, coin, answer problem, new problem, etc.)  -- shows in front-page feed

    



Markdown, Katex, Quill
 - Markdown: easier to do weird stuff  eg.  \(  before a list or paragraph, and whole block turns into a latex -- not sure how to do this with html
 - HTML: drag/drop images; interactive components; select text -> toolbar options; fonts, emojis, special items that could be given w/ points


   - Email verification
   - Materialize+CSS -> Tailwind
   - Mobile view, responsive
   - Delete question
   - Slow cold boot load (app.js + app.css getting beefy)
   - Text editor
        - Link component
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
   - Inflate/Deflate
        - Merge sequential text paragraphs w/ \n
    - BUG: Heading level: http://brilliant.jbud.me/brilliantexport/problems/2015-countdown-problem-20-a-cubic-expansion-in-a/2015-countdown-problem-20-a-cubic-expansion-in-a.html
    - Add question -> go to question page rather than /problems
    - BUG: Katex spacing  http://brilliant.laravel:8000/problem/280
    - BUG: Submit question w/ no solutions or category/level set




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
    - Competitions (team based? similar to CTF)
    - TODO / Tasks page -- cards of tasks/ideas that can be upvotes/starred/coined to raise priorities; users can submit suggestion tasks
    - Points based around subject: "you're now level 5 in Calculus! You should be ready to tackle double integrals" -- show branches of problems in your area (based off tags? moderators add "high quality" questions to particular branch?)
    - "High quality" question  (set by moderators)




        == Install ==

            # Setup Composer
            php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
            php -r "if (hash_file('sha384', 'composer-setup.php') === '906a84df04cea2aa72f40b5f787e49f22d4c2f19492ac310e8cba5b96ac8b64115ac402c8cd292b8a03482574915d1a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
            php composer-setup.php
            php -r "unlink('composer-setup.php');" composer

            # Install laravel, typesense
            # NOTE: You may need `php composer.phar` instead
            composer create-project laravel/laravel brilliant
            cd brilliant
            composer require laravel/scout php-http/curl-client typesense/typesense-php typesense/laravel-scout-typesense-driver nesbot/carbon
            #composer require devloopsnet/laravel-typesense

            # Install nvm/npm
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
            source ~/.bashrc
            nvm use v12.18.3
            nvm alias default 12.18.3

            # Git clone
            git clone https://github.com/Jbudone/brilliant brilliant.temp
            rsync -a brilliant.temp/ ./
            rm -r brilliant.temp

            # Setup env
            create database: brilliant
            npm install
            vim .env

            composer update

            # Build DB, seed
            php artisan migrate:fresh --seed

            # Mix assets
            npm run dev

            # localserver server host
            php artisan serve --host=brilliant.local

            # live server, edit .htaccess to redirect to public
                RewriteEngine on
                RewriteCond %{REQUEST_URI} !^public
                RewriteRule ^(.*)$ public/$1 [L]

            # Typesense
            TODO: Turn on Typesense service???
            php artisan scout:import App\\Models\\User


        == Local Startup ==
            php artisan server --host=brilliant.local
            npm run watch

            export TYPESENSE_API_KEY=xyz
            mkdir /tmp/typesense-data
            cd typesense
            ./typesense-server --data-dir=/tmp/typesense-data --api-key=$TYPESENSE_API_KEY --enable-cors



        == Update ==
            scp -R [/local/path/to/brilliant.parsed] [login]:~/brilliant/

            git pull

            source ~/.bashrc
            npm install
            # FIXME: migrate/seed but w/out deleting current docs
            npm run dev


            # NOTE FRESH INSTALL ONLY BELOW
            rm nohup.out
            nohup php artisan migrate:fresh --seed &








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
http://brilliant.local:8000/problem/41242


References
https://web.archive.org/web/20210617023042/https://brilliant.org/community/home/problems/popular/all/all/?no_js=true
https://web.archive.org/web/20210617031230/https://brilliant.org/discussions/thread/simpler-solution-of-mechanics-warmups-level-4/
https://www.commonsense.org/education/sites/default/files/experience-media-file/brilliant_10.png?width=660&height=415&iframe=1&slide=9&scalePhotos=1
https://www.commonsense.org/education/sites/default/files/experience-media-file/brilliant_9.png?width=660&height=415&iframe=1&slide=8&scalePhotos=1
https://www.commonsense.org/education/website/brilliant

