class NotesController < ArrayController
  shared_instance
  bind 'arranged_objects', 'Note.all'
  outlet :note_list
end