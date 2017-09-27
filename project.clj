(defproject metis-web "0.1.0-SNAPSHOT"
  :description "A web interface for the metis population genetics simulator"
  :url "http://github.com/tiagoantao/metis-web"
  :license {:name "GNU Affero General Public License (AGPL)"
            :url "https://www.gnu.org/licenses/agpl.html"}

  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.9.908"]
                 [reagent "0.8.0-alpha1"]
                 [cljsjs/d3 "4.3.0-5"]
                 [cljsjs/vega "3.0.1-0"]
                 [cljsjs/vega-lite "2.0.0-beta.14-0"]]

  :plugins [[lein-figwheel "0.5.11"]
            [lein-codox "0.10.3"]
            [lein-cljsbuild "1.1.6"]
            [lein-doo "0.1.7"]
            [lein-kibit "0.1.5"] ;Automate this
            [lein-bikeshed "0.4.1"] ;Automate this
            ]

  :cljsbuild
  {:builds {
            :dev
            {:source-paths ["src"]

             :figwheel {:on-jsload "metis-web.core/on-js-reload"}

             :compiler {:main metis-web.core
                        :output-to "target/metis-web.js"
                        :output-dir "target/"
                        :source-map-timestamp true
                        :preloads [devtools.preload]
                        :optimizations :none}}
            }}


  :codox {
          :output-path "docs"
          :language :clojurescript
          :source-paths ["src"]
          :metadata {:doc/format :markdown}
          }


  :figwheel {
             :css-dirs ["resources/public/css"] ;; watch and update CSS
             :nrepl-port 7888
             ;:validate-config false
             }

  :profiles {:dev {:dependencies [[binaryage/devtools "0.9.2"]
                                  [figwheel-sidecar "0.5.11"]
                                  [com.cemerick/piggieback "0.2.1"]]
                   :source-paths ["src" "dev"]
                   :repl-options {:nrepl-middleware [cemerick.piggieback/wrap-cljs-repl]}
                  }})
