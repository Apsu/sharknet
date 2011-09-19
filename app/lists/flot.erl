fun(Head, {Req}) ->
%%  Start({[{<<"headers">>,{[{<<"Content-Type">>,<<"text/plain">>}]}}]}),
  Fun = fun({Row}, _) ->
    {[{<<"key">>, [Hostname, DestIP, Year, Month, Day, Hour, Minute, Second]}, {<<"value">>, Value}]} = {Row},
    Send([Hostname, ", ", DestIP]),
    Send(<<"\n">>),
    {ok, nil}
  end,
  {ok, _} = FoldRows(Fun, nil),
  <<"">>
end.