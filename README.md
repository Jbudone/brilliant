    == TODO ==

        - Faster startup
        - Cleanup for Archive: Admin, DB schema, interactions, editing/adding, text editor
        - Weekly problems
            # Search for all: https://web.archive.org/web/*/http://brilliant.org/weekly-problems*
            # 2018 archive (the rest are stored separately)
            - https://web.archive.org/web/20210609154329/https://brilliant.org/weekly-problems/2018-12-17/basic/
                # 2x elements of each difficulty ; find same attribute in html of problem, need to scrape it out to json and map in file
                - document.querySelectorAll('[data-solvable]')[0].attributes['data-solvable']
            - Separate potw from problem as a separate component (similar to Comment, Discussion, etc.) ?
        - Problems Of The Week Archive: https://web.archive.org/web/20210610052908/https://brilliant.org/community/home/weekly-problems/#2017-02-06

        - Typesense: consider indexing/searching body; if so how do we display that in search? will it affect performance?
        - Typesense client api key rate limiting
        - Cache busting include css/js
        - Serve css/js -> public/ folder, SASS, Babylon
        - Production: strip out parts of css/js that aren't needed, tree shaking
        - Laravel caching  https://laracasts.com/series/laravel-8-from-scratch/episodes/10
        - Template sections of html (header file, footer file, etc.) for shared html
        - Hover question to see preview
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
        - ReCaptcha v3
        - Interactable check response from server (Throttled -> show error popup?)
        - Security
           - <form>  includes non-input elements (are those getting sent over?)
           - XSS attack via manual submission?  -- titles/solutions?
        - Throttling posts on success vs. failed  (eg. post -> fail validation -> try to fix -> fail again -> repeat until throttled)
        - AJAX request throttled -> dialog
        - Email verification
        - Materialize+CSS -> Tailwind
        - Mobile view, responsive
        - Slow cold boot load (app.js + app.css getting beefy)
        - Discussion parser
        - Profile page:  click user and see list of problems
        - Vue cleanup: Add $ref to element to reference from inside Vue component; emit custom events from child -> caught by parent component + validation; provide/inject props from parent -> child component; v-bind:value vs. v-model
        - BUG: large solutions http://brilliant.jbud.me/brilliantexport/problems/10th-problem-2016/10th-problem-2016.html
        - Inflate/Deflate: Merge sequential text paragraphs w/ \n
        - BUG: Heading level: http://brilliant.jbud.me/brilliantexport/problems/2015-countdown-problem-20-a-cubic-expansion-in-a/2015-countdown-problem-20-a-cubic-expansion-in-a.html
        - BUG: Katex spacing  http://brilliant.laravel:8000/problem/280
        - Answer question component
        - "High quality" question  (set by moderators)
        - Override Rules (eg. Password rule)
        - Typesense
            - Dig deeper into Scout
                https://www.youtube.com/watch?v=2Jy_4sL9Iug
                - "searchableAttributes" ??
            - Compare Scout driver against Database (instead of Typesense) to see if its just as fast (maybe typesense not necessary)
            - Queue Driver for Scout https://laravel.com/docs/8.x/queues + enable .env SCOUT_QUEUE




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
        nohup ./runtypesense &  # update .env with TYPESENSE host (host changes when you restart AWS)
        php artisan typesense:run  # will create typesense key, update .env with client key, and import \App\Models\Problem
                                   # NOTE: You should run this locally since it might be slower from webserver

    == Troubleshooting Typesense ==
        # does key work?
        curl -H 'x-typesense-api-key: XXXXXXXXXXXX' https://typesense-brilliant.glitchy.me/collections

        # use admin key to check if it exists in key list
        curl -H 'X-TYPESENSE-API-KEY: XXXXXXXXXXXX' "https://typesense-brilliant.glitchy.me:443/keys" | jq .

        # manually create a key
        curl -H 'X-TYPESENSE-API-KEY: XXXXXXXXXXXX' "https://typesense-brilliant.glitchy.me:443/keys" -d '{"description":"Test Manual Key","actions": ["collections:get", "collections:list", "documents:search"], "collections": ["title"]}'


    == Local Startup ==
        update .env configs for TYPESENSE
        php artisan serve --host=brilliant.local
        npm run watch

        docker run -p 8108:8108 -v/tmp/data:/data typesense/typesense:0.22.2 --data-dir /data --api-key=XXXXXXXXXXXX --enable-cors --allowed-origins="http://brilliant.local:8000"
        php artisan typesense:run  # NOTE: first startup will update the TYPESENSE_CLIENT_KEY in .env

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

        # OR UPDATE ONLY
        rm nohup.out
        php artisan migrate # fulfill outstanding migrations
        nohup php artisan archive:update &  # update problems from brilliant.parsed








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
https://www.commonsense.org/education/website/brilliant

