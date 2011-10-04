fun({Doc}) ->
  Get = fun(K, V) -> proplists:get_value(K, V) end,

  case Get(<<"type">>, Doc) of
    <<"TCP Conversations">> ->
      [Year, Month, Day, Hour, Minute, Second] = Get(<<"timestamp">>, Doc),
      Hostname = Get(<<"hostname">>, Doc),
      Duration = Get(<<"duration">>, Doc),

      lists:foreach(
        fun({Row}) ->
          Value = Get(<<"dest_port">>, Row),
          BytesTotal = Get(<<"bytes_total">>, Row),
          Emit([Hostname, Year, Month, Day, Hour, Minute, Second], [Value, round(BytesTotal / Duration)])
        end,
      Get(<<"events">>, Doc));
    _ ->
      ok
  end
end.
