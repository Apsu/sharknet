#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <netinet/in.h>

struct ip_pair
{
    struct in_addr src, dest;
    uint16_t srcport, destport;
    uint32_t count;
};

/*
** Hash a 32-bit unsigned integer.
**
** This is Bob Jenkins's 4-byte integer hash, full avalanche.
*/
static inline uint32_t hash_uint32(uint32_t v)
{
    v = (v + 0x7ed55d16) + (v << 12);
    v = (v ^ 0xc761c23c) ^ (v >> 19);
    v = (v + 0x165667b1) + (v <<  5);
    v = (v + 0xd3a2646c) ^ (v <<  9);
    v = (v + 0xfd7046c5) + (v <<  3);
    v = (v ^ 0xb55a4f09) ^ (v >> 16);
    return v;
}

/*
** Hash an IP address.
*/
static inline uint32_t hash_ip(const void *ip, size_t len)
{
    uint32_t *start = (uint32_t *)ip;
    uint32_t *end = (uint32_t *)(start + len / 4);
    uint32_t h;

    h = 0;
    while (start < end)
    {
        h += *start++;
        h = hash_uint32(h);
    }
    return h;
}

/*
** Hash a struct ip_pair.
*/
static inline uint32_t hash_ip_pair(struct ip_pair *p)
{
    uint32_t h;

    h = 0;
    h += hash_ip(&p->src, sizeof(p->src));
    h += hash_ip(&p->dest, sizeof(p->dest));
    h += hash_uint32(((uint32_t)p->srcport << 16) + (uint32_t)p->destport);
    return h;
}

/*
** A hash table for struct ip_pairs.
*/
static struct hash_table_slot
{
    size_t n;
    struct ip_pair *entries;
} hash_table[1048576];

/*
** Get the entry associated with the specified ip_pair.
*/
struct ip_pair *hash_get(struct ip_pair *p)
{
    struct hash_table_slot *slot;

    slot = &hash_table[hash_ip_pair(p) % ARRAY_SIZE(hash_table)];
    {
        size_t i;

        for (i = 0; i < slot->n; i++)
        {
            struct ip_pair *q = &slot->entries[i];

            if (memcmp(&p->src, &q->src, sizeof(p->src)) == 0 &&
                memcmp(&p->dest, &q->dest, sizeof(p->dest)) == 0 &&
                p->srcport == q->srcport &&
                p->destport == q->destport)
                return p;
        }
    }
    if (!RENEW_ARRAY(slot->entries, slot->n + 1))
        return NULL;

    slot->entries[slot->n].src = p->src;
    slot->entries[slot->n].dest = p->dest;
    slot->entries[slot->n].srcport = p->srcport;
    slot->entries[slot->n].destport = p->destport;
    slot->entries[slot->n].count = 0;
    return &slot->entries[slot->n++];
}
