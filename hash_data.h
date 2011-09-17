/*
** Hash a block of data to a 32-bit value.
*/
static uint32_t hash_data(const void *data, size_t len)
{
#define rotl32(x, r) ((x) << (r) | ((x) >> (32 - (r))))

	/*
	** This is MurmurHash3 written by Austin Appleby, who released it into
	** the public domain.
	*/
	const uint32_t c1 = 0xcc9e2d51;
	const uint32_t c2 = 0x1b873593;
	uint32_t h1 = 0;
	size_t nblocks;

	nblocks	= len / 4;
	data = (unsigned char *)data + nblocks * 4;

	/* body */
	{
		const uint32_t *body = (uint32_t *)data;
		size_t i;

		for (i = -nblocks; i != 0; i++)
		{
#if defined(__i386__) || defined(__x86_64__)
			uint32_t k1 = body[i];
#else
			uint32_t k1;
			uint32_t b0, b1, b2, b3;

			b0 = (uint32_t)((unsigned char *)(body + i))[0];
			b1 = (uint32_t)((unsigned char *)(body + i))[1] <<  8;
			b2 = (uint32_t)((unsigned char *)(body + i))[2] << 16;
			b3 = (uint32_t)((unsigned char *)(body + i))[3] << 24;
			k1 = b0 | b1 | b2 | b3;
#endif
			k1 *= c1;
			k1 = rotl32(k1, 15);
			k1 *= c2;

			h1 ^= k1;
			h1 = rotl32(h1, 13);
			h1 = h1 * 5 + 0xe6546b64;
		}
	}

	/* tail */
	{
		unsigned const char *tail = (unsigned const char *)data;
		uint32_t k1 = 0;

		switch (len & 3)
		{
			case 3:
				k1 ^= (uint32_t)tail[2] << 16;
			case 2:
				k1 ^= (uint32_t)tail[1] << 8;
			case 1:
				k1 ^= tail[0];
				k1 *= c1;
				k1 = rotl32(k1, 15);
				k1 *= c2;
				h1 ^= k1;
			default:
				/* empty */;
		}
	}

	/* finalization */
	h1 ^= (uint32_t)len;
	h1 ^= h1 >> 16;
	h1 *= 0x85ebca6b;
	h1 ^= h1 >> 13;
	h1 *= 0xc2b2ae35;
	h1 ^= h1 >> 16;
	return h1;
}
