fun({Doc}) ->
  Get = fun(K, V) -> proplists:get_value(K, V) end,

  case Get(<<"type">>, Doc) of
    <<"TCP Conversations">> ->
      Hostname = Get(<<"hostname">>, Doc),
      Duration = Get(<<"duration">>, Doc),
      Interface = Get(<<"interface">>, Doc),
      Timestamp = Get(<<"timestamp">>, Doc),

      lists:foreach(
        fun({Row}) ->
          Value = Get(<<"dest_port">>, Row),
          BytesTotal = Get(<<"bytes_total">>, Row),
          Emit([Hostname, Interface|Timestamp], [Value, round(BytesTotal / Duration)])
        end, Get(<<"events">>, Doc));
    _ ->
      ok
  end
end.
