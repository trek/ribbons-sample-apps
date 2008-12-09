class Note < Model
  data_source  'http://stikkies.local/notes'
  data_format  'json'
  kvc_accessor :name, :body
  
  @data = ArrangedObjects.new([Note.new,Note.new,Note.new])
  def self.all
    @data
  end

  def self.all=(ary)
    @data = ary
    self.did_change_value_for('all')
  end
end