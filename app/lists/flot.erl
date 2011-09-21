fun(Head, {Req}) ->
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
    {[{<<"key">>, Key}, {<<"value">>, Bytes}]} = {Row},
    [Hostname, Series | Timestamp] = Key,
    Unix = Epoch(Stamp(Timestamp)) * 1000, % For javascript
    case dict:find(Series, Dict) of
      {ok, Data} ->
        {ok, dict:store(Series, Data ++ [[Unix, Bytes]], Dict)};
      _ ->
        {ok, dict:store(Series, [[Unix, Bytes]], Dict)}
    end
  end,

  Deep = fun(Elem, {Flag, Acc}) ->
    Val = list_to_binary(integer_to_list(Elem)),
    case {Flag, Acc} of
      {false, nil} ->
        {true, <<"[", Val/binary, ",">>};
      {false, _}->
        {true, <<Acc/binary, ",[", Val/binary, ",">>};
      _ ->
        {false, <<Acc/binary, Val/binary, "]">>}
    end
  end,

  {ok, Stats} = FoldRows(Fold, dict:new()),

  Send(<<"{\"series\":[">>),

  dict:fold(
    fun(Key, Value, In) ->
      case In of
        <<",">> ->
          Send(In);
        _ -> ok
      end,
      B = list_to_binary(integer_to_list(Key)),
      Send(<<"{\"label\":\"", B/binary, "\",\"data\":[">>),
      {_, Bin} = lists:foldl(Deep, {false, nil}, lists:flatten(Value)),
      Send(<<Bin/binary, "]}">>),
      <<",">>
    end, nil, Stats),

  <<"]}">>
end.
