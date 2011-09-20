fun(Head, {Req}) ->
%%  Start({[{<<"headers">>,{[{<<"Content-Type">>,<<"text/plain">>}]}}]}),
  Stamp = fun(Fields) ->
    case length(Fields) of
      1 -> [Year] = Fields,
        {{Year, 1, 1}, {0, 0, 0}};
      2 -> [Year, Month] = Fields,
        {{Year, Month, 1}, {0, 0, 0}};
      3 -> [Year, Month, Day] = Fields,
        {{Year, Month, Day}, {0, 0, 0}};
      4 -> [Year, Month, Day, Hour] = Fields,
        {{Year, Month, Day}, {Hour, 0, 0}};
      5 -> [Year, Month, Day, Hour, Minute] = Fields,
        {{Year, Month, Day}, {Hour, Minute, 0}};
      6 -> [Year, Month, Day, Hour, Minute, Second] = Fields,
        {{Year, Month, Day}, {Hour, Minute, Second}};
      _ -> {{1970, 1, 1}, {0, 0, 0}}
    end
  end,

  Epoch = fun(Gregorian) ->
    UnixG = calendar:datetime_to_gregorian_seconds(Gregorian),
    UnixE = calendar:datetime_to_gregorian_seconds({{1970,1,1},{0,0,0}}),
    UnixG - UnixE
  end,

  Fold = fun({Row}, Dict) ->
    {[{<<"key">>, Key}, {<<"value">>, Value}]} = {Row},
    [Hostname, DestIP | Timestamp] = Key, %% group_level >= 2
    Unix = Epoch(Stamp(Timestamp)),
    {ok, dict:update_counter(Unix, Value, Dict)}
  end,

%%    Send({[{<<"label">>, DestIP}, {<<"series">>, integer_to_list(Epoch(DateTime))}]}),

  {ok, Stats} = FoldRows(Fold, dict:new()),
  dict:fold(
    fun(K, V, A) ->
      Send(integer_to_list(V)),
      nil
    end
    , nil, Stats)
end.
