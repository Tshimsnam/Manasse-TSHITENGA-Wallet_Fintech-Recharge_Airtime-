<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

     'allowed_origins' => [
        'http://localhost:3000',
    ],// port autorisé a comminuqué avec le backend

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
