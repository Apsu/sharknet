fun({Doc}) ->
  Get = fun(K, P) -> proplists:get_value(K, P) end,
  case Get(<<"type">>, Doc) of
    <<"TCP Conversations">> ->
      [Year, Month, Day, Hour, Minute, Second | _] = Get(<<"timestamp">>, Doc),
      Hostname = Get(<<"hostname">>, Doc),
      Duration = Get(<<"duration">>, Doc),
      lists:foreach(fun({Row}) ->
        DestIP = Get(<<"dest_ip">>, Row),
        BytesTotal = Get(<<"bytes_total">>, Row),
        Emit([Hostname, DestIP, Year, Month, Day, Hour, Minute, Second], round(BytesTotal / Duration))
      end, Get(<<"events">>, Doc));
    _ ->
      ok
  end
end.