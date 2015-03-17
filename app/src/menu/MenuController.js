(function () {

    angular
        .module('menu', ['ngMaterial', 'wallabag-restapi'])
        .controller('MenuController', ['$mdSidenav', '$mdBottomSheet', '$log', '$q', '$location',
            MenuController
        ]);

    /**
     * Menu Controller for Wallabag App
     * @param $mdSidenav
     * @param $mdBottomSheet
     * @constructor
     */
    function MenuController($mdSidenav, $mdBottomSheet, $log, $q, $location) {
        var self = this;

        self.selected = null;
        self.items = [];
        self.selectItem = selectItem;
        self.toggleMenuList = toggleMenuList;


        // Load all menu Items

        self.items = [
            {
                name: 'Unread',
                icon: 'unread',
                url: '/unread'
            },
            {
                name: 'Favorites',
                icon: 'favorite',
                url: '/favorite'
            },
            {
                name: 'Archive',
                icon: 'archive'
            },
            {
                name: 'Tags',
                icon: 'tag'
            },
            {
                name: 'Config',
                icon: 'config'
            },
            {
                name: 'About',
                icon: 'about'
            }
        ];

        // *********************************
        // Internal methods
        // *********************************

        /**
         * First hide the bottomsheet IF visible, then
         * hide or Show the 'left' sideNav area
         */
        function toggleMenuList() {
            var pending = $mdBottomSheet.hide() || $q.when(true);
            pending.then(function () {
                $mdSidenav('left').toggle();
            });
        }

        /**
         * Select the current Item
         * @param menuId
         */
        function selectItem(menuId) {
            console.log(menuId);
            self.selected = angular.isNumber(menuId) ? $scope.items[menuId] : menuId;
            $location.path(self.selected.url);
            self.toggleList();
        }


    }

    angular.module('menu')
        .controller('LoginController', [
             '$mdSidenav', '$mdBottomSheet', '$log', '$q','$rootScope', '$location', 'EntryService',
            LoginController
        ]);

    function LoginController($mdSidenav, $mdBottomSheet, $log, $q, $rootScope, $location, EntryService) {
        var self = this;

        self.username = 'wallabag';
        self.password = 'wallabag';
        self.login = login;

        function login(){
            if (self.username && self.password) {
                $rootScope.login = self.username;
                $rootScope.password = self.password;
                EntryService.getSalt({
                    login: self.username
                }, function (response) {
                    $rootScope.salt = response;
                    $location.path("/unread");
                });


            } else {
                console.log('enter login');
            }
        }

    }

    angular.module('menu')
        .controller('UnreadController', function ($rootScope, unreadURLs) {
        var ctrl = {
            unreadUrlList: unreadURLs,
            username: $rootScope.username
        };


        return ctrl;
    });

    angular.module('menu')
        .controller('entryController', function ($rootScope, EntryService, $scope, $timeout, $mdBottomSheet) {
            var ctrl = {
                username: $rootScope.username,
                url: '',
                title: ''
            };

            $scope.showGridBottomSheet = function ($event, articleId) {
                $scope.alert = '';
                $mdBottomSheet.show({
                    templateUrl: 'src/entries/view/bottom-grid.html',
                    controller: 'GridBottomSheetCtrl',
                    targetEvent: $event
                }).then(function (clickedItem) {
                    $scope.alert = articleId + ' ' + clickedItem.name + ' clicked!';
                });
            };

            ctrl.favoriteEntry = function () {

            };
            return ctrl;
        })

    angular.module('menu')
        .controller('GridBottomSheetCtrl', function ($scope, $mdBottomSheet) {
            $scope.items = [
                {
                    name: 'Readed',
                    icon: 'read'
                },
                {
                    name: 'Favorite',
                    icon: 'favorite'
                },
                {
                    name: 'Tags',
                    icon: 'tag'
                },
                {
                    name: 'Delete',
                    icon: 'delete'
                },
                {
                    name: 'Original',
                    icon: 'link'
                },
            ];
            $scope.listItemClick = function ($index) {
                var clickedItem = $scope.items[$index];
                $mdBottomSheet.hide(clickedItem);
            };
        })

})();