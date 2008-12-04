require 'rack/request'
require 'rack/response'
require 'rubygems' rescue nil
require 'haml' rescue nil
require 'sass' rescue nil
require 'red'
require 'red/executable'
require 'optparse'
require 'ftools'
require 'find'

include Red

class Ribbon  
  STYLE_FILE    = 'public/build/style.css'
  BEHAVIOR_FILE = 'public/build/behavior.js'
  
  attr_reader :styles, :behaviors
  
  def initialize
    @styles = ''
    @behaviors = ''
  end
  
  def call(env)
    Red.init(__FILE__)
    Rack::Response.new([], 200,  {"Content-Type" => "text/html"}) do |r|
      r.write build_structure
    end.finish
  end
  
  def build_behavior
    true
  end
  
  def application_files
    files_in('app')
  end
  
  def framework_files
    files_in('lib')
  end
  
  def files_in(name)
    text = ''
    ::Find.find(name) do |path|
      if FileTest.directory?(path)
        next
      else
        next unless File.extname(path) == '.red' || File.extname(path) == '.rb'
        text << "\n" << ::File.read(path)
      end
    end
    return text
  end
  
  def redshift
    "require 'redshift'\n"
  end
  
  def write_style_file(styles)
    File.open(STYLE_FILE, 'w') do |f|
      f.write Sass::Engine.new(styles).render
    end
  end
  
  def write_behavior_file(interface)
    File.open(BEHAVIOR_FILE, 'w') do |f|
      f.write  translate_to_string_including_ruby(redshift + framework_files + application_files + interface.views + interface.initializations)
    end
  end
  
  def build_structure
    context   = ViewContext.new(self)
    structure = Haml::Engine.new(::File.read('app/layouts/application.haml')).render(context)
    write_style_file(context.styles)
    write_behavior_file(context)
    return structure
  end
end

class ViewContext
  attr_reader :styles, :views, :initializations
  def initialize(request)
    @styles = ''
    @views = ''
    @initializations = ''
  end
  
  def add_initialization(name, view_type, bindings)
    cname = view_type.gsub(/\/(.?)/) { "::#{$1.upcase}" }.gsub(/(?:^|_)(.)/) { $1.upcase } # camelize
    @initializations << "\n" << "#{cname}.new(#{name.inspect},#{bindings.inspect})"
  end
  
  def add_style_and_behavior_for(name)
    @styles << "\n" << ::File.read("lib/views/#{name}/style.sass")
    @views << "\n" << ::File.read("lib/views/#{name}/behavior.red")
  end
  
  def parsed_view(name)
    Haml::Engine.new(::File.read("lib/views/#{name}/structure.haml"))
  end
  
  def workspace_view(name='', options={}, &block)
    add_initialization(name, 'workspace_view', options[:bind])
    add_style_and_behavior_for('workspace_view')
    haml_concat parsed_view('workspace_view').render(self,&block)
  end
  
  def split_view(name='', options={}, &block)
    add_initialization(name, 'split_view', options[:bind])
    add_style_and_behavior_for('split_view')
    haml_concat parsed_view('split_view').render(self,&block)
  end
  
  def list_view(name='',options={},&block)
    add_initialization(name, 'list_view', options[:bind])
    add_style_and_behavior_for('list_view')
    haml_concat parsed_view('list_view').render(self,&block)
  end
  
  def list_item_view(options={}, &block)
    add_style_and_behavior_for('list_item_view')
    haml_concat parsed_view('list_item_view').render(self,&block)
  end
  
  def splitter_view(&block)
    add_style_and_behavior_for('splitter_view')
    haml_concat parsed_view('splitter_view').render(self,&block)
  end
  
  def text_view(options={}, &block)
    add_style_and_behavior_for('text_view')
    haml_concat parsed_view('text_view').render(self,&block)
  end
  
  def identify
    'view_1'
  end
end

if $0 == __FILE__
  require 'rack'
  require 'rack/showexceptions'
  Rack::Handler::WEBrick.run \
    Rack::ShowExceptions.new(Rack::Lint.new(Rack::Herring.new)),
    :Port => 9292
end