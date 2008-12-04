class Note < Model
  data_source  'http://stikkies.local/notes'
  data_format  'json'
  kvc_accessor :name, :body
end