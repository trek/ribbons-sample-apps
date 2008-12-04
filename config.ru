require 'ribbons'

use Rack::Static, :urls => ["/public"]
use Rack::ShowExceptions
run Ribbon.new
