angular.module('wallabag-restapi', ['ngResource'])

    .factory('TokenHandler', ['$http', '$rootScope', function ($http, $rootScope) {
        var tokenHandler = {};
        var token = 'none';

        tokenHandler.set = function (newToken) {
            token = newToken;
        };

        tokenHandler.get = function () {
            return token;
        };

        tokenHandler.getCredentials = function (username, password, salt) {
            // Check if token is registered in cookies

            nonce = tokenHandler.generateNonce(16);
            nonceB64 = base64encode(nonce);
            // Creation time of the token
            var created = formatDate(new Date());
            console.log('created=' + created);
            // Generating digest from secret, creation and seed
            var encryptedPassword = hex_sha1(password + username + salt);

            b64pad = "=";
            var digest = b64_sha1(nonce + created + encryptedPassword);


            // Return generated token

            return 'UsernameToken Username="' + username + '", PasswordDigest="' + digest + '", Nonce="' + nonceB64 + '", Created="' + created + '"';

        };

        tokenHandler.generateNonce = function (length) {
            var nonceChars = "0123456789abcdef";
            var result = "";
            for (var i = 0; i < length; i++) {
                result += nonceChars.charAt(Math.floor(Math.random() * nonceChars.length));
            }
            return result;
        }



        // Token wrapper for resource actions
        tokenHandler.wrapActions = function (resource, actions, login, password, salt) {
            var wrapperResource = resource;

            for (var i = 0; i < actions.length; i++) {
                tokenWrapper(wrapperResource, actions[i]);
            }

            return wrapperResource;
        };

        // Token wrapper
        var tokenWrapper = function (resource, action) {
            resource['_' + action] = resource[action];
            resource[action] = function (data, success, error) {
                console.log('set header x-wsse');
                console.log($rootScope.login + ', ' + $rootScope.password + ', ' + $rootScope.salt);
                if ($rootScope.login != undefined && $rootScope.password != undefined && $rootScope.salt != undefined){
                    $http.defaults.headers.common['X-WSSE'] = tokenHandler.getCredentials($rootScope.login, $rootScope.password, $rootScope.salt);
                }
                return resource['_' + action](
                    data,
                    success,
                    error
                );
            };
        };

        // Date formater to UTC
        var formatDate = function (d) {
            // Padding for date creation
            var pad = function (num) {
                return ("0" + num).slice(-2);
            };

            return [d.getUTCFullYear(),
                    pad(d.getUTCMonth() + 1),
                    pad(d.getUTCDate())].join("-") + "T" + [pad(d.getUTCHours()),
                    pad(d.getUTCMinutes()),
                    pad(d.getUTCSeconds())].join(":") + "Z";
        };

        return tokenHandler;
    }])




    .factory('EntryService', ['$resource', 'TokenHandler', function ($resource, tokenHandler) {
        var resource = $resource('http://v2.wallabag.org/api/entries.json', null, {
            'getUnreads': {
                method: 'GET',
                isArray: true
            },
            'getSalt': {
                url: 'http://v2.wallabag.org/api/salts/:login.json',
                method: 'GET',
                isArray: true
            },
            'addEntry': {
                url: 'http://v2.wallabag.org/api/entries.json',
                method: 'POST'
            }
        });
        resource = tokenHandler.wrapActions(resource, ['getUnreads', 'addEntry']);
        return resource;
    }])





;