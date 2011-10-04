fun(Keys, Values, Rereduce) ->
  %Log(couch_util:to_list(Rereduce)),
  Dict = lists:foldl(
    fun(Item, Dict) ->
      case is_tuple(Item) of
        true ->  {Port, Bytes} = Item;
        false -> [Port, Bytes] = Item
      end,
      %Log(couch_util:to_list(Bytes)),
      dict:update(
        Port, % Key
        fun(Data) -> 
          [Count, Total] = Data,
          [Count + 1, Total + Bytes] % For cumulative average
        end,
        [1, Bytes], % Initial value
        Dict)
    end,
  dict:new(), Values),
  lists:map(
    fun(Item) ->
      tuple_to_list(Item)
    end,
    dict:to_list(dict:map(
    fun(Key, Value) ->
      Log(lists:flatten(Value)),
      [Count, Total] = Value,
      Total / Count
    end, Dict)))
%%  dict:fold(
%%    fun(Key, Value, In) ->
%%            %%[Count, Total] = Value,
%%            %%[Key, Total|In]
%%      Value
%%    end, [], Dict)
end.
